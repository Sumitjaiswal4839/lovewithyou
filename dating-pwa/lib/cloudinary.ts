/**
 * Reusable Cloudinary Direct Upload Utility
 * Uploads media files (photos, student IDs, audio notes) directly to Cloudinary
 * using the 'lovewithyou_preset' and 'LOVEWITHYOU' folder.
 */

export async function uploadToCloudinary(file: File | Blob, folderOverride?: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dpexzhhae";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "lovewithyou_preset";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  if (folderOverride) {
    formData.append("folder", `LOVEWITHYOU/${folderOverride}`);
  }

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
}
