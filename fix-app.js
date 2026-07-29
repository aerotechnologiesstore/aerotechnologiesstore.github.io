import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZMC9gBR2j_omhCDRHixBn-h5r1RePqIY",
  authDomain: "aero-store-b6a9b.firebaseapp.com",
  projectId: "aero-store-b6a9b",
  storageBucket: "aero-store-b6a9b.firebasestorage.app",
  messagingSenderId: "779360959349",
  appId: "1:779360959349:web:a17ed297270975cc1db13c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'apps'));
  snap.forEach(d => {
    if (d.data().title && d.data().title.includes('Chess')) {
      console.log('Found App:', d.id, d.data().title, 'isPlayable:', d.data().isPlayable);
      if (!d.data().isPlayable) {
        console.log('Fixing isPlayable for', d.id);
        updateDoc(doc(db, 'apps', d.id), { isPlayable: true }).then(() => {
          console.log('Fixed.');
        });
      }
    }
  });
}
run();
