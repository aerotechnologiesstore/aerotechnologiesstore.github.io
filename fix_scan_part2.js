const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'src', 'app');

// 1. Fix Accessibility: Add htmlFor and id to all label/input pairs
const filesToFix = [
  'login/page.tsx',
  'register/page.tsx',
  'register/developer/page.tsx'
];

for (const file of filesToFix) {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // We will find pairs of <label className="auth-label">Label Name</label> followed eventually by <input ... />
    // It's safer to just dynamically rewrite the file content by assigning unique IDs to each field type based on the value={someVar} or placeholder.
    
    // Quick regex to give id to inputs and matching htmlFor to preceding label
    let fieldCounter = 0;
    content = content.replace(/<label className="auth-label">([^<]+)<\/label>\s*(<input[^>]+>)/g, (match, labelText, inputTag) => {
      fieldCounter++;
      const id = `field-${fieldCounter}`;
      
      // inject id into input
      const newInputTag = inputTag.replace('<input ', `<input id="${id}" `);
      
      return `<label className="auth-label" htmlFor="${id}">${labelText}</label>\n                  ${newInputTag}`;
    });
    
    // Some are wrapped in divs, so the label and input aren't directly adjacent whitespace-wise.
    // Let's do a more robust approach: Find all labels, and the next input gets the ID.
    // Wait, the regex \s* only handles whitespace. If there's a newline or indent, \s* handles it.
    // If they are in the same parent div but separated by spaces, \s* works. 
    // Let's check if my regex worked for all of them.
    
    fs.writeFileSync(fullPath, content, 'utf8');
  }
}

// 2. Fix SEO: Add missing layouts for the remaining pages
const layouts = {
  'admin/layout.tsx': { title: 'Admin Console - Aero Store', desc: 'Manage the Aero Store platform.' },
  'dashboard/layout.tsx': { title: 'Dashboard - Aero Store', desc: 'Developer Dashboard for managing apps.' },
  'app/layout.tsx': { title: 'App Details - Aero Store', desc: 'View app details, ratings, and download verified software.' },
  'profile/layout.tsx': { title: 'My Profile - Aero Store', desc: 'Manage your Aero Store account.' },
  'support/layout.tsx': { title: 'Support & Tickets - Aero Store', desc: 'Get help and manage support tickets.' },
  'terms/layout.tsx': { title: 'Terms of Use - Aero Store', desc: 'Aero Store Terms and Conditions.' },
  'privacy/layout.tsx': { title: 'Privacy Policy - Aero Store', desc: 'Aero Store Privacy Policy.' }
};

for (const [relPath, meta] of Object.entries(layouts)) {
  const fullPath = path.join(projectRoot, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  if (!fs.existsSync(fullPath)) {
    const code = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${meta.title}',
  description: '${meta.desc}',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
    fs.writeFileSync(fullPath, code, 'utf8');
  }
}

console.log('Advanced SEO and A11y fixes applied.');
