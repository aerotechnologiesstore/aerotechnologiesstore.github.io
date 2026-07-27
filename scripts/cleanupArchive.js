const fs = require('fs');
const path = require('path');

// Load env
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

const accessKey = process.env.NEXT_PUBLIC_ARCHIVE_ORG_ACCESS_KEY;
const secretKey = process.env.NEXT_PUBLIC_ARCHIVE_ORG_SECRET_KEY;

if (!accessKey || !secretKey) {
  console.error("Missing Archive.org keys");
  process.exit(1);
}

const itemsToDelete = [
  'aero-store-icon-aero_store-1785066414439',
  'aero-store-banner-aero_store-1785066450037',
  'aero-store-icon-ludo_offline-1785065868512',
  'aero-store-icon-tic_tac_toe-1785064218401',
  'aero-store-banner-tic_tac_toe-1785064833145',
  'aero-store-announcement-upload-1785068510882'
];

async function deleteItem(identifier) {
  console.log(`Deleting identifier: ${identifier}`);
  // We can delete the entire item by sending DELETE to the S3 endpoint for the bucket
  // Actually, Archive S3 API allows deleting individual files.
  // To delete an entire item, you usually delete all files in it.
  // Let's just try to delete the item via S3 API, but usually S3 API only deletes files.
  // We can just fetch the item's files and delete them.
  try {
    const res = await fetch(`https://archive.org/metadata/${identifier}`);
    const data = await res.json();
    
    if (data && data.files) {
      for (const file of data.files) {
        if (file.name) {
           const targetUrl = `https://s3.us.archive.org/${identifier}/${file.name}`;
           const delRes = await fetch(targetUrl, {
             method: 'DELETE',
             headers: {
               'Authorization': `LOW ${accessKey}:${secretKey}`
             }
           });
           console.log(`  - Deleted ${file.name}: ${delRes.status}`);
        }
      }
    }
  } catch (err) {
    console.error(`Error deleting ${identifier}:`, err);
  }
}

async function run() {
  for (const id of itemsToDelete) {
    await deleteItem(id);
  }
  console.log("Cleanup Complete!");
}

run();
