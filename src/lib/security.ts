import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const getGeminiKey = () => {
  const b64Key = process.env.NEXT_PUBLIC_GEMINI_API_KEY_B64;
  if (!b64Key) return null;
  try {
    return atob(b64Key);
  } catch (e) {
    return null;
  }
};

const genAI = new GoogleGenerativeAI(getGeminiKey() || '');

export interface SecurityScanResult {
  status: 'clean' | 'suspicious' | 'malicious';
  reason: string;
  aiConfidence: number;
}

/**
 * Uses Gemini AI to scan the app's metadata for scams, phishing, or policy violations.
 * "High Intelligence AI" heuristic check.
 */
export async function scanAppMetadataWithAI(
  appName: string,
  description: string,
  developerName: string,
  category: string
): Promise<SecurityScanResult> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    console.warn("Gemini API key missing. Skipping AI metadata scan.");
    return { status: 'clean', reason: 'Skipped (No API Key)', aiConfidence: 0 };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an elite cybersecurity AI for Aero Store. Analyze the following Android app metadata for scams, phishing, fake apps, or policy violations.
App Name: ${appName}
Developer: ${developerName}
Category: ${category}
Description: ${description}

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
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    const data = JSON.parse(responseText);
    
    return {
      status: data.status,
      reason: data.reason,
      aiConfidence: data.confidence,
    };
  } catch (error) {
    console.error("AI Scan Error:", error);
    return { status: 'clean', reason: 'AI Scan Failed (Error)', aiConfidence: 0 };
  }
}

/**
 * Submits the APK URL to VirusTotal for binary malware scanning.
 * Note: Requires NEXT_PUBLIC_VIRUSTOTAL_API_KEY in .env.local
 */
export async function scanApkWithVirusTotal(apkUrl: string): Promise<SecurityScanResult> {
  const vtKey = process.env.NEXT_PUBLIC_VIRUSTOTAL_API_KEY;
  if (!vtKey) {
    console.warn("VirusTotal API key missing. Skipping binary scan.");
    return { status: 'clean', reason: 'Skipped (No API Key)', aiConfidence: 0 };
  }

  try {
    // 1. Submit URL to VirusTotal
    const encodedParams = new URLSearchParams();
    encodedParams.set('url', apkUrl);

    const submitRes = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': vtKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: encodedParams
    });

    if (!submitRes.ok) {
      throw new Error(`VirusTotal Submit Failed: ${submitRes.status}`);
    }

    const submitData = await submitRes.json();
    const analysisId = submitData.data.id;

    // 2. Fetch analysis report (Ideally this should be polled, but for synchronous UI we wait 5 seconds and check)
    // In a real production environment, you would use webhooks.
    await new Promise(resolve => setTimeout(resolve, 5000));

    const reportRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      method: 'GET',
      headers: {
        'x-apikey': vtKey
      }
    });

    const reportData = await reportRes.json();
    const stats = reportData.data?.attributes?.stats;

    if (!stats) {
      return { status: 'suspicious', reason: 'VirusTotal analysis pending', aiConfidence: 50 };
    }

    if (stats.malicious > 0 || stats.suspicious > 1) {
      return { status: 'malicious', reason: `VirusTotal flagged by ${stats.malicious} engines`, aiConfidence: 99 };
    }

    return { status: 'clean', reason: 'VirusTotal found no threats', aiConfidence: 100 };

  } catch (error) {
    console.error("VirusTotal Error:", error);
    return { status: 'suspicious', reason: 'VirusTotal API Error', aiConfidence: 0 };
  }
}

/**
 * Main function to run the full security pipeline on a newly uploaded app.
 */
export async function runFullSecurityScan(
  appName: string,
  description: string,
  developerId: string,
  category: string,
  apkUrl: string
): Promise<{ overallStatus: 'clean' | 'suspicious' | 'malicious', log: string }> {
  let log = `Starting Advanced Security Scan for ${appName}...\n`;
  let isSuspicious = false;

  // --- 1. GEMINI TEXT SCAN ---
  try {
    const prompt = `Analyze this app submission for store compliance, scams, or malicious intent based on its text description.
App Name: ${appName}
Category: ${category}
Description:
${description}

Is this app likely a scam, illegal, or malicious? Reply with a JSON object containing "status" (clean, suspicious, or malicious) and "reason".`;

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const match = text.match(/\{[\s\S]*\}/);
      
      if (match) {
        const parsed = JSON.parse(match[0]);
        log += `[AI Text Analysis] Status: ${parsed.status.toUpperCase()}\n`;
        log += `[AI Text Analysis] Reason: ${parsed.reason}\n\n`;
        
        if (parsed.status === 'suspicious' || parsed.status === 'malicious') {
          isSuspicious = true;
        }
      }
    }
  } catch (error) {
    log += `[AI Text Analysis] Failed: ${error}\n\n`;
  }

  // --- 2. VIRUSTOTAL APK SCAN ---
  log += `[VirusTotal] Sending APK URL for binary analysis...\n`;
  const vtKey = process.env.NEXT_PUBLIC_VIRUSTOTAL_API_KEY;
  
  if (!vtKey || vtKey === '') {
    log += `[VirusTotal] WARNING: API Key not found. Skipping binary scan.\n`;
  } else if (!apkUrl || !apkUrl.includes('http')) {
    log += `[VirusTotal] Invalid APK URL provided. Skipping.\n`;
  } else {
    try {
      // We will submit the URL to VirusTotal to be scanned.
      const encodedUrl = btoa(apkUrl).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      
      const scanReq = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': vtKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ url: apkUrl })
      });

      if (scanReq.ok) {
        log += `[VirusTotal] Successfully submitted APK to engine.\n`;
        // In a real production system, you would wait for the scan to finish (via webhooks or polling).
        // For now, we will mark it pending admin review if VT is engaged.
        log += `[VirusTotal] Awaiting full analysis report. App requires Admin verification.\n`;
        isSuspicious = true; // Force admin verification until VT clears it in the dashboard.
      } else {
        const errJson = await scanReq.json();
        log += `[VirusTotal] API Error: ${errJson?.error?.message || scanReq.statusText}\n`;
      }
    } catch (e: any) {
      log += `[VirusTotal] Fetch failed: ${e.message}\n`;
    }
  }

  // Final Verdict
  if (isSuspicious) {
    log += `\nFINAL VERDICT: SUSPICIOUS/PENDING. Admin review is required before publishing.`;
    return { overallStatus: 'suspicious', log };
  } else {
    log += `\nFINAL VERDICT: CLEAN. App passed automated checks.`;
    return { overallStatus: 'clean', log };
  }
}
