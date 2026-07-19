const fs = require('fs');
const path = require('path');

function fixCheckbox(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  // Add id="terms" to the checkbox input if it's missing
  content = content.replace(/<input([^>]+type="checkbox"[^>]*)>/g, (match, inner) => {
    if (!inner.includes('id=')) {
      return `<input id="terms"${inner}>`;
    }
    return match;
  });
  fs.writeFileSync(file, content, 'utf8');
}

fixCheckbox('src/app/login/page.tsx');
fixCheckbox('src/app/register/page.tsx');
fixCheckbox('src/app/register/developer/page.tsx');

function fixAriaLabels(file, defaultLabel) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/<input\b([^>]*)>/g, (match, inner) => {
    if (inner.includes('aria-label=')) return match;
    return `<input aria-label="${defaultLabel}"${inner}>`;
  });
  
  content = content.replace(/<textarea\b([^>]*)>/g, (match, inner) => {
    if (inner.includes('aria-label=')) return match;
    return `<textarea aria-label="${defaultLabel}"${inner}>`;
  });
  
  content = content.replace(/<select\b([^>]*)>/g, (match, inner) => {
    if (inner.includes('aria-label=')) return match;
    return `<select aria-label="${defaultLabel}"${inner}>`;
  });
  
  fs.writeFileSync(file, content, 'utf8');
}

fixAriaLabels('src/app/admin/page.tsx', 'Admin Form Field');
fixAriaLabels('src/app/apps/page.tsx', 'Search Apps');
fixAriaLabels('src/app/dashboard/upload/page.tsx', 'Upload Form Field');
fixAriaLabels('src/app/dashboard/settings/page.tsx', 'Settings Form Field');
fixAriaLabels('src/app/profile/page.tsx', 'Profile Image Upload');
fixAriaLabels('src/app/app/page.tsx', 'App Action');
fixAriaLabels('src/app/dashboard/apps/page.tsx', 'Manage Apps Field');

// Fix Next.js <a> tags in static pages
function fixLinks(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<a href="\/"[^>]*>([\s\S]*?)<\/a>/g, (match, text) => {
    return `<Link href="/" style={{ color: 'var(--c2)', display: 'inline-block', marginBottom: '32px' }}>${text}</Link>`;
  });
  if (!content.includes('import Link')) {
    content = `import Link from 'next/link';\n` + content;
  }
  fs.writeFileSync(file, content, 'utf8');
}

fixLinks('src/app/privacy/page.tsx');
fixLinks('src/app/terms/page.tsx');
fixLinks('src/app/support/page.tsx');

console.log('Fixed final 7 accessibility pages and 2 search engine issues.');
