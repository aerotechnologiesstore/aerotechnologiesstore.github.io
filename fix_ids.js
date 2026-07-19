const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'src', 'app');
const filesToFix = [
  'login/page.tsx',
  'register/page.tsx',
  'register/developer/page.tsx'
];

for (const file of filesToFix) {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // We already added htmlFor="field-X" to labels. Let's find them, extract X, and add id="field-X" to the following input.
    // We can do this by regexing htmlFor="field-(\d+)". Then looking for the next <input 
    
    let parts = content.split(/htmlFor="([^"]+)"/);
    if (parts.length > 1) {
      // parts[0] is before first htmlFor
      // parts[1] is the id (e.g. "field-1")
      // parts[2] is everything after it up to the next htmlFor, etc.
      
      let newContent = parts[0];
      for (let i = 1; i < parts.length; i += 2) {
        let id = parts[i];
        let chunk = parts[i+1];
        
        // Find the first <input in this chunk and inject the id
        // Replace first <input with <input id="id"
        chunk = chunk.replace(/<input\b([^>]*)>/, (match, inner) => {
          if (inner.includes(`id="${id}"`)) return match; // already has it
          return `<input id="${id}"${inner}>`;
        });
        
        newContent += `htmlFor="${id}"` + chunk;
      }
      
      fs.writeFileSync(fullPath, newContent, 'utf8');
    }
  }
}

console.log('Fixed orphan labels by injecting IDs into inputs.');
