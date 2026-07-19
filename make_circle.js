const fs = require('fs');

const cssPath = 'src/app/globals.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Replace nav-logo-img
content = content.replace(/\.nav-logo-img\s*{[^}]*}/, `.nav-logo-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.6s ease;
  box-shadow: 0 0 16px var(--glow);
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}`);

// Replace hero-logo
content = content.replace(/\.hero-logo\s*{[^}]*}/, `.hero-logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
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
  border-radius: 50%;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}`);

fs.writeFileSync(cssPath, content, 'utf8');
console.log('CSS updated successfully to circles');
