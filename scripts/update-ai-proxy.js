const fs = require('fs');

const files = [
  'src/app/admin/page.tsx',
  'src/app/dashboard/update/page.tsx',
  'src/app/dashboard/upload/page.tsx',
  'src/app/support/page.tsx',
  'src/components/SecurityAI.tsx',
  'src/components/StrikeBot.tsx'
];

const target = `const getGroqKey = () => {
  const rev = process.env.NEXT_PUBLIC_GROQ_API_KEY_REV || '';
  return rev.split('').reverse().join('');
};
const rawGroqKey = getGroqKey();
const groq = new Groq({ apiKey: rawGroqKey, dangerouslyAllowBrowser: true });`;

const replacement = `const groq = new Groq({ 
  apiKey: 'proxy-key', 
  baseURL: process.env.NEXT_PUBLIC_AI_PROXY_URL || 'https://aero-ai-proxy.aerotechnologies-store.workers.dev',
  dangerouslyAllowBrowser: true 
});`;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  } catch(e) {
    console.error('Error updating ' + file + ': ' + e);
  }
});
