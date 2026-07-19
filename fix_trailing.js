const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Match href="/aerostore/somepath" and append trailing slash if missing
  // It matches anything that starts with /aerostore/ inside an href, ending without a slash
  // before the closing quote. Note: doesn't affect assets like .png
  content = content.replace(/href="(\/aerostore\/[a-zA-Z0-9_-]+)"/g, 'href="$1/"');
  content = content.replace(/href="(\/aerostore\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)"/g, 'href="$1/"');
  fs.writeFileSync(f, content);
});
console.log('Fixed trailing slashes successfully');
