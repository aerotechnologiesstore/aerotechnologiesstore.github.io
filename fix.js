const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // replace href="/" with href="/aerostore/" but only if it doesn't already start with /aerostore/
  content = content.replace(/href="\/(?!aerostore\/)/g, 'href="/aerostore/');
  fs.writeFileSync(f, content);
});
console.log('Fixed hrefs successfully');
