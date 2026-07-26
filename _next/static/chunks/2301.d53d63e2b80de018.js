"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2301],{2301:(e,t,a)=>{a.d(t,{runFullSecurityScan:()=>l});var s=a(7313),i=a(7358);let r=new s.ij((()=>{let e="QVEuQWI4Uk42SWw3VFZoaExoWVNEenRNbk9mbjJBREp2cy1MbGFNanc4YWFzRV92bHFGcXc=";if(!e)return null;try{return atob(e)}catch(e){return null}})()||"");async function l(e,t,a,s,l){let n=`Starting Advanced Security Scan for ${e}...
`,o=!1;try{let a=`Analyze this app submission for store compliance, scams, or malicious intent based on its text description.
App Name: ${e}
Category: ${s}
Description:
${t}

Is this app likely a scam, illegal, or malicious? Reply with a JSON object containing "status" (clean, suspicious, or malicious) and "reason".`;if(r){let e=r.getGenerativeModel({model:"gemini-1.5-flash"}),t=await e.generateContent(a),s=(await t.response).text().match(/\{[\s\S]*\}/);if(s){let e=JSON.parse(s[0]);n+=`[AI Text Analysis] Status: ${e.status.toUpperCase()}
[AI Text Analysis] Reason: ${e.reason}

`,("suspicious"===e.status||"malicious"===e.status)&&(o=!0)}}}catch(e){n+=`[AI Text Analysis] Failed: ${e}

`}n+=`[VirusTotal] Sending APK URL for binary analysis...
`;let u=i.env.NEXT_PUBLIC_VIRUSTOTAL_API_KEY;if(u&&""!==u)if(l&&l.includes("http"))try{btoa(l).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");let e=await fetch("https://www.virustotal.com/api/v3/urls",{method:"POST",headers:{"x-apikey":u,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({url:l})});if(e.ok)n+=`[VirusTotal] Successfully submitted APK to engine.
[VirusTotal] Awaiting full analysis report. App requires Admin verification.
`,o=!0;else{let t=await e.json();n+=`[VirusTotal] API Error: ${t?.error?.message||e.statusText}
`}}catch(e){n+=`[VirusTotal] Fetch failed: ${e.message}
`}else n+=`[VirusTotal] Invalid APK URL provided. Skipping.
`;else n+=`[VirusTotal] WARNING: API Key not found. Skipping binary scan.
`;return o?{overallStatus:"suspicious",log:n+=`
FINAL VERDICT: SUSPICIOUS/PENDING. Admin review is required before publishing.`}:{overallStatus:"clean",log:n+=`
FINAL VERDICT: CLEAN. App passed automated checks.`}}}}]);