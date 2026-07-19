const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace absolute URLs
  content = content.replace(/https:\/\/aero-store\.github\.io\/aerostore/g, 'https://aerotechnologiesstore.github.io');
  
  // Replace absolute paths
  content = content.replace(/"\/aerostore\//g, '"/');
  content = content.replace(/'\/aerostore\//g, "'/");
  content = content.replace(/`\/aerostore\//g, '`/');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
  }
});
