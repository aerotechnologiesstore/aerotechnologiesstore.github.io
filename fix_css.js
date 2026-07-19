const fs = require('fs');

const cssPath = 'src/app/globals.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Replace hero-logo
content = content.replace(/\.hero-logo\s*{[^}]*}/, `.hero-logo {
  width: 120px;
  height: 120px;
  border-radius: 28px;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 50px var(--glow);
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}`);

// Replace footer-logo
content = content.replace(/\.footer-logo\s*{[^}]*}/, `.footer-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}`);

fs.writeFileSync(cssPath, content, 'utf8');
console.log('CSS updated successfully');
