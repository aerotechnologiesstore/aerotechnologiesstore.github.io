const fs = require('fs');
const path = require('path');

function fixUseClient(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // If the file contains "use client", ensure it's at the very top
  if (content.includes('"use client"')) {
    // Remove all instances of "use client"
    content = content.replace(/"use client";\n?/g, '');
    content = content.replace(/'use client';\n?/g, '');
    
    // Add it to the top
    content = '"use client";\n' + content;
    fs.writeFileSync(file, content, 'utf8');
  }
}

fixUseClient('src/app/privacy/page.tsx');
fixUseClient('src/app/terms/page.tsx');
fixUseClient('src/app/support/page.tsx');

console.log('Fixed use client directive');
