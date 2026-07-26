"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2301],{2301:(e,a,t)=>{t.d(a,{runFullSecurityScan:()=>i});let s=new(t(7313)).ij((()=>{let e="QVEuQWI4Uk42SWw3VFZoaExoWVNEenRNbk9mbjJBREp2cy1MbGFNanc4YWFzRV92bHFGcXc=";if(!e)return null;try{return atob(e)}catch(e){return null}})()||"");async function i(e,a,t,i,r){let l=`Starting Advanced Security Scan for ${e}...
`,n=!1;try{let t=`Analyze this app submission for store compliance, scams, or malicious intent based on its text description.
App Name: ${e}
Category: ${i}
Description:
${a}

Is this app likely a scam, illegal, or malicious? Reply with a JSON object containing "status" (clean, suspicious, or malicious) and "reason".`;if(s){let e=s.getGenerativeModel({model:"gemini-1.5-flash"}),a=await e.generateContent(t),i=(await a.response).text().match(/\{[\s\S]*\}/);if(i){let e=JSON.parse(i[0]);l+=`[AI Text Analysis] Status: ${e.status.toUpperCase()}
[AI Text Analysis] Reason: ${e.reason}

`,("suspicious"===e.status||"malicious"===e.status)&&(n=!0)}}}catch(e){l+=`[AI Text Analysis] Failed: ${e}

`}l+=`[VirusTotal] Sending APK URL for binary analysis...
`;let o="96fd5e2974ffec607a337a35fd86ef57402c4d127dfd93ef4c5f8ca0d37ec271";if(o&&1)if(r&&r.includes("http"))try{btoa(r).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");let e=await fetch("https://www.virustotal.com/api/v3/urls",{method:"POST",headers:{"x-apikey":o,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({url:r})});if(e.ok)l+=`[VirusTotal] Successfully submitted APK to engine.
[VirusTotal] Awaiting full analysis report. App requires Admin verification.
`,n=!0;else{let a=await e.json();l+=`[VirusTotal] API Error: ${a?.error?.message||e.statusText}
`}}catch(e){l+=`[VirusTotal] Fetch failed: ${e.message}
`}else l+=`[VirusTotal] Invalid APK URL provided. Skipping.
`;else l+=`[VirusTotal] WARNING: API Key not found. Skipping binary scan.
`;return n?{overallStatus:"suspicious",log:l+=`
FINAL VERDICT: SUSPICIOUS/PENDING. Admin review is required before publishing.`}:{overallStatus:"clean",log:l+=`
FINAL VERDICT: CLEAN. App passed automated checks.`}}}}]);