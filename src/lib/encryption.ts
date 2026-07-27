// E2EE Utility for Support Chats and AI Logs

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_E2EE_KEY || 'AeroStoreSecureKey2026!@#$123456';

const getPasswordKey = async () => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(ENCRYPTION_KEY),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("AeroSaltV1"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptText = async (text: string): Promise<string> => {
  if (!text) return text;
  
  try {
    const key = await getPasswordKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoded
    );

    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const cipherHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `E2EE::${ivHex}::${cipherHex}`;
  } catch (e) {
    console.error("Encryption failed", e);
    return text;
  }
};

export const decryptText = async (encryptedText: string): Promise<string> => {
  if (!encryptedText || !encryptedText.startsWith('E2EE::')) return encryptedText;

  try {
    const parts = encryptedText.split('::');
    if (parts.length !== 3) return encryptedText;

    const ivHex = parts[1];
    const cipherHex = parts[2];

    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const ciphertext = new Uint8Array(cipherHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const key = await getPasswordKey();

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed", e);
    return "🔒 [Encrypted Message]";
  }
};
