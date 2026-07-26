"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2301],{2301:(e,a,t)=>{t.d(a,{runFullSecurityScan:()=>c});var s=t(7313),n=t(7358);let i=()=>{let e="QVEuQWI4Uk42SWw3VFZoaExoWVNEenRNbk9mbjJBREp2cy1MbGFNanc4YWFzRV92bHFGcXc=";if(!e)return null;try{return atob(e)}catch(e){return null}},r=new s.ij(i()||"");async function o(e,a,t,s){if(!i())return console.warn("Gemini API key missing. Skipping AI metadata scan."),{status:"clean",reason:"Skipped (No API Key)",aiConfidence:0};let n=r.getGenerativeModel({model:"gemini-1.5-flash"}),o=`
You are an elite cybersecurity AI for Aero Store. Analyze the following Android app metadata for scams, phishing, fake apps, or policy violations.
App Name: ${e}
Developer: ${t}
Category: ${s}
Description: ${a}

Strict Rules:
1. Flag any app promising "Free Robux", "Free V-Bucks", "Free Money", or hacking/cracking tools.
2. Flag any app pretending to be a major brand (e.g. "WhatsApp Official" by an unknown dev).
3. Be lenient with normal indie apps.

Respond strictly in this JSON format without any markdown blocks:
{
  "status": "clean" | "suspicious" | "malicious",
  "reason": "Short explanation of why",
  "confidence": 0-100
}
  `;try{let e=(await n.generateContent(o)).response.text().trim().replace(/```json/g,"").replace(/```/g,""),a=JSON.parse(e);return{status:a.status,reason:a.reason,aiConfidence:a.confidence}}catch(e){return console.error("AI Scan Error:",e),{status:"clean",reason:"AI Scan Failed (Error)",aiConfidence:0}}}async function u(e){let a=n.env.NEXT_PUBLIC_VIRUSTOTAL_API_KEY;if(!a)return console.warn("VirusTotal API key missing. Skipping binary scan."),{status:"clean",reason:"Skipped (No API Key)",aiConfidence:0};try{let t=new URLSearchParams;t.set("url",e);let s=await fetch("https://www.virustotal.com/api/v3/urls",{method:"POST",headers:{"x-apikey":a,"Content-Type":"application/x-www-form-urlencoded"},body:t});if(!s.ok)throw Error(`VirusTotal Submit Failed: ${s.status}`);let n=(await s.json()).data.id;await new Promise(e=>setTimeout(e,5e3));let i=await fetch(`https://www.virustotal.com/api/v3/analyses/${n}`,{method:"GET",headers:{"x-apikey":a}}),r=await i.json(),o=r.data?.attributes?.stats;if(!o)return{status:"suspicious",reason:"VirusTotal analysis pending",aiConfidence:50};if(o.malicious>0||o.suspicious>1)return{status:"malicious",reason:`VirusTotal flagged by ${o.malicious} engines`,aiConfidence:99};return{status:"clean",reason:"VirusTotal found no threats",aiConfidence:100}}catch(e){return console.error("VirusTotal Error:",e),{status:"suspicious",reason:"VirusTotal API Error",aiConfidence:0}}}async function c(e,a,t,s,n){let i=await o(e,a,t,s),r=await u(n),c="clean";return"malicious"===r.status||"malicious"===i.status?c="malicious":("suspicious"===r.status||"suspicious"===i.status)&&(c="suspicious"),{overallStatus:c,log:`AI Scan: ${i.status.toUpperCase()} (${i.reason})
VT Scan: ${r.status.toUpperCase()} (${r.reason})`}}}}]);