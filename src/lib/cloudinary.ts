/* ─── Cloudinary Configuration ─── */

export const CLOUDINARY_CLOUD_NAME = "xpyj3zjs";
export const CLOUDINARY_API_KEY = "337886245751274";

// Unsigned upload preset — must be created in Cloudinary Dashboard
// Settings → Upload → Upload presets → Add unsigned preset → name it "aero_store"
export const CLOUDINARY_UPLOAD_PRESET = "aero_store";

/**
 * Upload a file to Cloudinary using unsigned upload.
 * Works client-side, no API secret needed.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "aero-store",
  resourceType: "image" | "raw" | "auto" = "auto"
): Promise<{ url: string; publicId: string; bytes: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    bytes: data.bytes,
  };
}

/**
 * Upload an APK file to Cloudinary (raw file type).
 */
export async function uploadAPK(file: File, appName: string) {
  return uploadToCloudinary(file, `aero-store/apks/${appName}`, "raw");
}

/**
 * Upload an app screenshot to Cloudinary.
 */
export async function uploadScreenshot(file: File, appId: string) {
  return uploadToCloudinary(file, `aero-store/screenshots/${appId}`, "image");
}

/**
 * Upload an app icon to Cloudinary.
 */
export async function uploadAppIcon(file: File, appId: string) {
  return uploadToCloudinary(file, `aero-store/icons/${appId}`, "image");
}

/**
 * Upload a developer verification document.
 */
export async function uploadVerificationDoc(file: File, userId: string) {
  return uploadToCloudinary(file, `aero-store/verification/${userId}`, "image");
}
