const fs = require('fs');
const path = require('path');

const files = [
  'src/app/page.tsx',
  'src/app/login/page.tsx',
  'src/app/register/page.tsx',
  'src/app/register/developer/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add logoHue to themes
  content = content.replace(/logo:'\/logos\/logo-orange\.png'/g, "logo:'/logos/logo-orange.png', logoHue: '0deg'");
  content = content.replace(/logo:'\/logos\/logo-blue\.png'/g, "logo:'/logos/logo-blue.png', logoHue: '190deg'");
  content = content.replace(/logo:'\/logos\/logo-purple\.png'/g, "logo:'/logos/logo-purple.png', logoHue: '260deg'");
  content = content.replace(/logo:'\/logos\/logo-rocket\.png'/g, "logo:'/logos/logo-rocket.png', logoHue: '45deg'");
  
  // Add property setting
  if (content.includes('document.documentElement.style.setProperty(')) {
    content = content.replace(/document\.documentElement\.style\.setProperty\('--glow',\s*t\.glow\);/g, "document.documentElement.style.setProperty('--glow', t.glow);\n      document.documentElement.style.setProperty('--logo-hue', t.logoHue);");
  }
  
  fs.writeFileSync(file, content, 'utf8');
}

// Update CSS
const cssPath = 'src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/\.nav-logo-img\s*{([^}]*)}/, ".nav-logo-img {$1  filter: hue-rotate(var(--logo-hue, 0deg));\n}");
css = css.replace(/\.hero-logo\s*{([^}]*)}/, ".hero-logo {$1  filter: hue-rotate(var(--logo-hue, 0deg));\n}");
css = css.replace(/\.footer-logo\s*{([^}]*)}/, ".footer-logo {$1  filter: hue-rotate(var(--logo-hue, 0deg));\n}");
fs.writeFileSync(cssPath, css, 'utf8');

console.log('Hue rotation injected successfully');
