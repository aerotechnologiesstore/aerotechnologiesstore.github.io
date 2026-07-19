const fs = require('fs');
const path = require('path');

const uploadDir = 'C:/Users/aashu/.gemini/antigravity/brain/0b653757-5584-436e-8f26-890423679209/.user_uploaded';
const logoDir = path.join(__dirname, 'public', 'logos');

// 1. Copy the 4 newly provided logos over the existing ones
fs.copyFileSync(path.join(uploadDir, 'media__1784286939396.png'), path.join(logoDir, 'logo-orange.png'));
fs.copyFileSync(path.join(uploadDir, 'media__1784286947397.png'), path.join(logoDir, 'logo-blue.png'));
fs.copyFileSync(path.join(uploadDir, 'media__1784286953493.png'), path.join(logoDir, 'logo-purple.png'));
fs.copyFileSync(path.join(uploadDir, 'media__1784286960052.jpg'), path.join(logoDir, 'logo-rocket.png'));

console.log('Logos copied successfully.');

// 2. Remove the CSS hue-rotation filter from globals.css
const cssPath = path.join(__dirname, 'src', 'app', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/  filter: hue-rotate\(var\(--logo-hue, 0deg\)\);\n/g, '');
fs.writeFileSync(cssPath, css, 'utf8');

console.log('CSS filters removed successfully.');
