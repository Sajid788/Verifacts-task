import crypto from "crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUD_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_API_SECRET;
const uploadFolder = process.env.CLOUDINARY_FOLDER || "verifacts-documents";

function assertCloudinaryConfig() {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are missing");
  }
}

function signParams(params) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export async function uploadToCloudinary(file, options = {}) {
  assertCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = options.publicId || `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const params = {
    folder: options.folder || uploadFolder,
    public_id: publicId,
    timestamp,
  };

  const formData = new FormData();
  formData.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", params.folder);
  formData.append("public_id", params.public_id);
  formData.append("signature", signParams(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }

  return data;
}

export { cloudName, apiKey, uploadFolder };
