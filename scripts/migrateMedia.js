const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc } = require('firebase/firestore');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8').replace(/\r/g, '').split('\n');
  for (const line of envConfig) {
    if (line && !line.startsWith('#') && line.includes('=')) {
      const parts = line.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/['"]/g, '');
      process.env[key] = val;
    }
  }
}

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'aero store';

async function uploadBufferToSupabase(buffer, mimetype, filename, folder) {
  const filePath = `${folder}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: false
    });

  if (error) {
    throw new Error(`Supabase Upload Failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

async function migrateUrl(oldUrl, folder, filename) {
  if (!oldUrl || !oldUrl.includes('archive.org')) return oldUrl;
  
  console.log(`Downloading: ${oldUrl}`);
  try {
    const res = await fetch(oldUrl);
    if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
    
    const buffer = await res.arrayBuffer();
    const mimetype = res.headers.get('content-type') || 'application/octet-stream';
    
    console.log(`Uploading to Supabase: ${folder}/${filename}`);
    const newUrl = await uploadBufferToSupabase(buffer, mimetype, filename, folder);
    
    // Optional: Delete from Archive.org
    const workerUrl = process.env.NEXT_PUBLIC_ARCHIVE_ORG_WORKER_URL;
    if (workerUrl) {
      try {
        const parts = oldUrl.split('archive.org/download/')[1].split('/');
        if (parts.length >= 2) {
          const identifier = parts[0];
          const fname = parts.slice(1).join('/');
          const endpoint = `${workerUrl}/${encodeURIComponent(identifier)}/${encodeURIComponent(fname)}`;
          await fetch(endpoint, { method: 'DELETE' });
          console.log(`Deleted from Archive.org: ${oldUrl}`);
        }
      } catch (e) {
        console.error(`Failed to delete from archive.org:`, e.message);
      }
    }
    
    return newUrl;
  } catch (err) {
    console.error(`Error migrating ${oldUrl}:`, err.message);
    return oldUrl; // return original if fail
  }
}

async function runMigration() {
  console.log("Starting Migration...");

  // 1. Migrate Apps (icons, banners)
  console.log("--- MIGRATING APPS ---");
  const appsSnap = await getDocs(collection(db, 'apps'));
  for (const docSnap of appsSnap.docs) {
    const data = docSnap.data();
    let updates = {};
    
    if (data.iconUrl && data.iconUrl.includes('archive.org')) {
      const newUrl = await migrateUrl(data.iconUrl, `icons/${data.developerId}`, 'icon.png');
      if (newUrl !== data.iconUrl) updates.iconUrl = newUrl;
    }
    if (data.bannerUrl && data.bannerUrl.includes('archive.org')) {
      const newUrl = await migrateUrl(data.bannerUrl, `banners/${data.developerId}`, 'banner.png');
      if (newUrl !== data.bannerUrl) updates.bannerUrl = newUrl;
    }
    
    if (Object.keys(updates).length > 0) {
      await updateDoc(docSnap.ref, updates);
      console.log(`Updated App ${docSnap.id}`);
    }
  }

  // 2. Migrate Announcements
  console.log("--- MIGRATING ANNOUNCEMENTS ---");
  const annSnap = await getDocs(collection(db, 'announcements'));
  for (const docSnap of annSnap.docs) {
    const data = docSnap.data();
    if (data.mediaUrl && data.mediaUrl.includes('archive.org')) {
      const newUrl = await migrateUrl(data.mediaUrl, `announcements`, 'media.png');
      if (newUrl !== data.mediaUrl) {
        await updateDoc(docSnap.ref, { mediaUrl: newUrl });
        console.log(`Updated Announcement ${docSnap.id}`);
      }
    }
  }

  // 3. Migrate Users (Profile Photos)
  console.log("--- MIGRATING USERS ---");
  const userSnap = await getDocs(collection(db, 'users'));
  for (const docSnap of userSnap.docs) {
    const data = docSnap.data();
    if (data.photoURL && data.photoURL.includes('archive.org')) {
      const newUrl = await migrateUrl(data.photoURL, `profiles/${docSnap.id}`, 'profile.png');
      if (newUrl !== data.photoURL) {
        await updateDoc(docSnap.ref, { photoURL: newUrl });
        console.log(`Updated User ${docSnap.id}`);
      }
    }
  }

  console.log("MIGRATION COMPLETE!");
  process.exit(0);
}

runMigration();
