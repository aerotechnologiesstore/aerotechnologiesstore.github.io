import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signOut,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const yahooProvider = new OAuthProvider('yahoo.com');

import emailjs from '@emailjs/browser';

/**
 * Sends a welcome email using EmailJS.
 */
async function sendWelcomeEmail(email: string, name: string, role: 'user' | 'developer') {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn("EmailJS keys missing. Welcome email not sent.");
      return;
    }

    const subject = role === 'developer' ? 'Welcome to Aero Store Developer Program! 🚀' : 'Welcome to Aero Store! 🎉';
    
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://aerotechnologiesstore.github.io/logos/logo-orange.png" alt="Aero Store" style="max-width: 180px;" />
        </div>
        <h2 style="color: #FF6B00; text-align: center;">${subject}</h2>
        <p>Hi ${name || 'there'},</p>
    `;

    if (role === 'developer') {
      htmlContent += `
        <p>Thank you for joining the Aero Store Developer Program. We are thrilled to have you on board!</p>
        <h3>Start building your empire:</h3>
        <ul>
          <li>Upload your apps via APK files or direct GitHub URLs.</li>
          <li>Schedule your app launches down to the minute.</li>
          <li>Track downloads and manage your portfolio directly from the Developer Dashboard.</li>
          <li>Reach millions of users across the globe.</li>
        </ul>
      `;
    } else {
      htmlContent += `
        <p>Thank you for joining Aero Store. Your gateway to the best apps and games is now open!</p>
        <h3>Explore our features:</h3>
        <ul>
          <li>Browse and download the latest apps and games effortlessly.</li>
          <li>Leave reviews and rate your favorite applications.</li>
          <li>Personalize your profile and discover new themes.</li>
        </ul>
      `;
    }

    htmlContent += `
        <br/>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
          By using our platform, you agree to our policies. Please review them here:<br/>
          <br/>
          <a href="https://aerotechnologiesstore.github.io/terms/" style="color: #FF6B00; text-decoration: none; font-weight: bold;">Terms & Conditions</a> &nbsp;|&nbsp; 
          <a href="https://aerotechnologiesstore.github.io/privacy/" style="color: #FF6B00; text-decoration: none; font-weight: bold;">Privacy Policy</a>
        </p>
      </div>
    `;

    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email,
        subject: subject,
        html_content: htmlContent,
      },
      publicKey
    );
    console.log("Welcome email sent via EmailJS!");
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function signUpUser(email: string, pass: string, name: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  
  await updateProfile(user, { displayName: name });
  
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    displayName: name,
    role: 'user',
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    isVerified: false,
    agreedToTerms: true
  });
  
  if (user.email) {
    await sendWelcomeEmail(user.email, name, 'user');
    await sendEmailVerification(user);
  }
  
  return user;
}

export async function signUpDeveloper(email: string, pass: string, name: string, company: string, address: string, addressPrivate: boolean = false) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  
  await updateProfile(user, { displayName: name });
  
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    displayName: name,
    role: 'developer',
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    isVerified: false,
    agreedToTerms: true
  });
  
  await setDoc(doc(db, 'developers', user.uid), {
    companyName: company,
    address: address,
    addressPrivate: addressPrivate,
    verificationStatus: 'pending',
    hasVerificationBadge: false,
    totalApps: 0,
    createdAt: serverTimestamp()
  });
  
  if (user.email) {
    await sendWelcomeEmail(user.email, name, 'developer');
    await sendEmailVerification(user);
  }
  
  return user;
}

/**
 * Upgrades an existing logged-in user to a developer account.
 * Does NOT create a new Firebase Auth account — just updates Firestore.
 */
export async function upgradeToDeveloper(company: string, address: string, addressPrivate: boolean = false) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to upgrade.");

  // Update the user role to developer
  await setDoc(doc(db, 'users', user.uid), {
    role: 'developer',
    lastActive: serverTimestamp(),
  }, { merge: true });

  // Create the developer profile doc
  await setDoc(doc(db, 'developers', user.uid), {
    companyName: company,
    address: address,
    addressPrivate: addressPrivate,
    verificationStatus: 'pending',
    hasVerificationBadge: false,
    totalApps: 0,
    createdAt: serverTimestamp()
  }, { merge: true });

  if (user.email) {
    await sendWelcomeEmail(user.email, user.displayName || 'Developer', 'developer');
  }

  return user;
}

export async function loginWithEmail(email: string, pass: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

async function handleOAuthProvider(provider: any) {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    await setDoc(docRef, {
      email: user.email || '',
      displayName: user.displayName || 'User',
      role: 'user',
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      isVerified: false,
      agreedToTerms: true
    });
    
    if (user.email) {
      await sendWelcomeEmail(user.email, user.displayName || 'there', 'user');
    }
  } else {
    await setDoc(docRef, { lastActive: serverTimestamp() }, { merge: true });
  }
  
  return user;
}

export async function loginWithGoogle() { return handleOAuthProvider(googleProvider); }
export async function loginWithGithub() { return handleOAuthProvider(githubProvider); }
export async function loginWithFacebook() { return handleOAuthProvider(facebookProvider); }
export async function loginWithMicrosoft() { return handleOAuthProvider(microsoftProvider); }
export async function loginWithYahoo() { return handleOAuthProvider(yahooProvider); }

export async function logoutUser() {
  await signOut(auth);
}
