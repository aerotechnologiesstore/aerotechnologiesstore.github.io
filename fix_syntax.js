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
    
    // 1. Revert the broken syntax caused by the regex failing on '=>'
    content = content.replace(/e = aria-label="[^"]+">/g, 'e =>');
    
    // 2. Remove any accidentally inserted aria-labels from previous run
    content = content.replace(/ aria-label="[^"]+"/g, '');
    
    // 3. Safely inject aria-label right after placeholder="..."
    content = content.replace(/placeholder="([^"]+)"/g, (match, p1) => {
      return `placeholder="${p1}" aria-label="${p1}"`;
    });
    
    fs.writeFileSync(fullPath, content, 'utf8');
  }
}

console.log('Syntax fixed and aria-labels safely injected.');
