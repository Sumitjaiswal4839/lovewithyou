/**
 * Cloudinary Upload Utility
 * Uploads a base64 or File object to Cloudinary and returns the secure URL.
 * Uses unsigned upload preset — no server needed.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const DEFAULT_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "LOVEWITHYOU";

/**
 * Upload a single image (base64 data URL or File) to Cloudinary.
 * Returns the secure HTTPS URL of the uploaded image.
 */
export async function uploadToCloudinary(
  imageData: string | File,
  folder = DEFAULT_FOLDER
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary env vars missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
  }

  const formData = new FormData();

  if (typeof imageData === "string") {
    // It's a base64 data URL — pass directly
    formData.append("file", imageData);
  } else {
    // It's a File object
    formData.append("file", imageData);
  }

  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

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
