/**
 * Cloudinary Upload Utility
 * Uploads a base64 or File object to Cloudinary and returns the secure URL.
 * Uses unsigned upload preset — no server needed.
 */

import { API_BASE_URL, fetchWithAuth } from "./api";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const DEFAULT_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "LOVEWITHYOU/profiles";

/**
 * Upload a single image (base64 data URL or File) to Cloudinary securely.
 * Returns the secure HTTPS URL of the uploaded image.
 */
export async function uploadToCloudinary(
  imageData: string | File,
  folder = DEFAULT_FOLDER
): Promise<string> {
  if (!CLOUD_NAME) {
    throw new Error("Cloudinary env vars missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  }

  // 1. Fetch secure signature from our Go backend
  const sigRes = await fetchWithAuth(`${API_BASE_URL}/api/v1/cloudinary/signature?folder=${folder}`);
  if (!sigRes.ok) {
    throw new Error("Failed to get Cloudinary signature from backend");
  }
  const { signature, timestamp, apiKey } = await sigRes.json();

  const formData = new FormData();

  if (typeof imageData === "string") {
    formData.append("file", imageData);
  } else {
    formData.append("file", imageData);
  }

  // 2. Upload to Cloudinary securely using the signature
  formData.append("folder", folder);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Cloudinary upload failed: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}

/**
 * Upload multiple images in parallel to Cloudinary.
 * Returns array of secure URLs in the same order.
 */
export async function uploadMultipleToCloudinary(
  images: string[],
  folder = DEFAULT_FOLDER
): Promise<string[]> {
  const uploads = images.map((img) =>
    img.startsWith("http")
      ? Promise.resolve(img) // already a URL, skip upload
      : uploadToCloudinary(img, folder)
  );
  return Promise.all(uploads);
}
