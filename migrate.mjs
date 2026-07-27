import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

// Load environment variables manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.replace(/\r/g, '').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

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

function makeArchiveId(prefix, name) {
  const timestamp = Date.now();
  const sanitized = (name || 'unknown').replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  const identifier = `aero-store-${prefix}-${sanitized}-${timestamp}`;
  return { identifier, timestamp, sanitized };
}

async function uploadToArchive(buffer, type, identifier, filename, title) {
  const workerUrl = env.NEXT_PUBLIC_ARCHIVE_ORG_WORKER_URL;
  if (!workerUrl) throw new Error("Worker URL missing");

  const endpoint = `${workerUrl}/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`;

  const resp = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': type || 'application/octet-stream',
      'x-archive-meta-mediatype': 'software',
      'x-archive-meta-title': title,
      'x-archive-meta-description': `${title} - Distributed via Aero Store`
    },
    body: buffer
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Upload failed: ${resp.status} ${resp.statusText} - ${text}`);
  }

  return `https://archive.org/download/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`;
}

async function runMigration() {
  console.log("Starting Migration...");

  try {
    // Migrate Apps
    console.log("Fetching apps...");
    const appsSnapshot = await getDocs(collection(db, 'apps'));
    console.log(`Found ${appsSnapshot.size} apps.`);

    for (const appDoc of appsSnapshot.docs) {
      const appData = appDoc.data();
      const updates = {};
      let changed = false;

      const migrateUrl = async (urlField, prefix, filenamePrefix) => {
        if (appData[urlField] && appData[urlField].includes('supabase.co')) {
          console.log(`Migrating ${urlField} for app: ${appData.appName}`);
          try {
            const resp = await fetch(appData[urlField]);
            const buffer = await resp.arrayBuffer();
            const type = resp.headers.get('content-type') || 'application/octet-stream';
            
            const { identifier } = makeArchiveId(prefix, appData.appName);
            const ext = appData[urlField].split('.').pop()?.split('?')[0] || 'bin';
            const filename = `${filenamePrefix}_${Date.now()}.${ext}`;

            const newUrl = await uploadToArchive(buffer, type, identifier, filename, `${appData.appName} ${prefix}`);
            updates[urlField] = newUrl;
            changed = true;
            console.log(`Success: ${newUrl}`);
          } catch (e) {
            console.error(`Failed to migrate ${urlField} for ${appData.appName}:`, e);
          }
        }
      };

      await migrateUrl('iconUrl', 'icon', 'icon');
      await migrateUrl('bannerUrl', 'banner', 'banner');
      await migrateUrl('apkUrl', 'apk', (appData.appName || 'app').replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase());

      if (changed) {
        await updateDoc(doc(db, 'apps', appDoc.id), updates);
        console.log(`Updated Firestore for app: ${appData.appName}`);
      }
    }

    // Migrate Users
    console.log("Fetching users...");
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`Found ${usersSnapshot.size} users.`);

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      if (user.photoURL && user.photoURL.includes('supabase.co')) {
        console.log(`Migrating photoURL for user: ${userDoc.id}`);
        try {
          const resp = await fetch(user.photoURL);
          const buffer = await resp.arrayBuffer();
          const type = resp.headers.get('content-type') || 'image/jpeg';
          
          const { identifier } = makeArchiveId('profile', userDoc.id);
          const ext = user.photoURL.split('.').pop()?.split('?')[0] || 'jpg';
          const filename = `profile_${Date.now()}.${ext}`;

          const newUrl = await uploadToArchive(buffer, type, identifier, filename, 'Profile Picture');
          await updateDoc(doc(db, 'users', userDoc.id), { photoURL: newUrl });
          console.log(`Success: ${newUrl}`);
        } catch (e) {
          console.error(`Failed to migrate photoURL for ${userDoc.id}:`, e);
        }
      }
    }

    console.log("Migration Complete!");
  } catch (err) {
    console.error("Migration fatal error:", err);
  }
  
  process.exit(0);
}

runMigration();
