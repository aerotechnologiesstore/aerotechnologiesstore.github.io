const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'src', 'app');
const publicRoot = path.join(__dirname, 'public');

// 1. Create robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://aerotechnologiesstore.github.io/sitemap.xml
`;
fs.writeFileSync(path.join(publicRoot, 'robots.txt'), robotsTxt, 'utf8');

// 2. Create sitemap.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://aerotechnologiesstore.github.io/</loc><priority>1.0</priority></url>
  <url><loc>https://aerotechnologiesstore.github.io/login/</loc><priority>0.8</priority></url>
  <url><loc>https://aerotechnologiesstore.github.io/register/</loc><priority>0.8</priority></url>
  <url><loc>https://aerotechnologiesstore.github.io/register/developer/</loc><priority>0.8</priority></url>
  <url><loc>https://aerotechnologiesstore.github.io/apps/</loc><priority>0.9</priority></url>
  <url><loc>https://aerotechnologiesstore.github.io/about/</loc><priority>0.7</priority></url>
</urlset>
`;
fs.writeFileSync(path.join(publicRoot, 'sitemap.xml'), sitemapXml, 'utf8');

// 3. Create layout files for SEO metadata
const layouts = {
  'login/layout.tsx': { title: 'Login - Aero Store', desc: 'Log in to your Aero Store account to download verified apps.' },
  'register/layout.tsx': { title: 'Sign Up - Aero Store', desc: 'Create a free Aero Store account to discover incredible apps.' },
  'register/developer/layout.tsx': { title: 'Developer Registration - Aero Store', desc: 'Register as a verified developer to publish apps to millions of users.' },
  'apps/layout.tsx': { title: 'Browse Apps - Aero Store', desc: 'Discover safe, verified, and high-quality apps on Aero Store.' }
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

// 4. Accessibility: Inject aria-labels into inputs based on placeholders
const filesToFix = [
  'login/page.tsx',
  'register/page.tsx',
  'register/developer/page.tsx'
];

for (const file of filesToFix) {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // We regex match <input ... placeholder="XYZ" ... > and ensure it has an aria-label="XYZ"
    // Since we know the codebase, we'll just forcefully add aria-label everywhere we see placeholder="..."
    content = content.replace(/(<input[^>]*?placeholder=")([^"]+?)("[^>]*?)(>)/g, (match, p1, p2, p3, p4) => {
      // If it already has an aria-label, skip
      if (match.includes('aria-label=')) return match;
      return `${p1}${p2}${p3} aria-label="${p2}"${p4}`;
    });
    
    fs.writeFileSync(fullPath, content, 'utf8');
  }
}

console.log('SEO and Accessibility fixes applied.');
