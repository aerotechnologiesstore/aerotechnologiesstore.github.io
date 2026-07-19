const fs = require('fs');
const path = require('path');

const logoDir = path.join(__dirname, 'public', 'logos');
const tsxFiles = [
  'src/app/page.tsx',
  'src/app/login/page.tsx',
  'src/app/register/page.tsx',
  'src/app/register/developer/page.tsx'
];

// 1. Rename files in public/logos to -v2
const logos = ['logo-orange.png', 'logo-blue.png', 'logo-purple.png', 'logo-rocket.png'];

logos.forEach(logo => {
  const oldPath = path.join(logoDir, logo);
  const newPath = path.join(logoDir, logo.replace('.png', '-v2.png'));
  if (fs.existsSync(oldPath)) {
    fs.copyFileSync(oldPath, newPath);
  }
});

// 2. Update paths in TSX files
tsxFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\/logos\/logo-orange\.png/g, '/logos/logo-orange-v2.png');
    content = content.replace(/\/logos\/logo-blue\.png/g, '/logos/logo-blue-v2.png');
    content = content.replace(/\/logos\/logo-purple\.png/g, '/logos/logo-purple-v2.png');
    content = content.replace(/\/logos\/logo-rocket\.png/g, '/logos/logo-rocket-v2.png');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

// Also update layout.tsx which has the metadata logos
const layoutPath = path.join(__dirname, 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  let layout = fs.readFileSync(layoutPath, 'utf8');
  layout = layout.replace(/\/logos\/logo-orange\.png/g, '/logos/logo-orange-v2.png');
  fs.writeFileSync(layoutPath, layout, 'utf8');
}

console.log('Cache busting applied!');
