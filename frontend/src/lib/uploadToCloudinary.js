import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(localFilePath, userId) {
  try {
    const result = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: "video",
      public_id: `cuts/${userId}_${Date.now()}`,
    });

    return result.secure_url;
  } catch (error) {
    if (error.http_code === 400 && error.message.includes("File size too large")) {
      console.error("❌ Upload falhou: arquivo excede limite de tamanho.");
      throw new Error("O arquivo é muito grande. O limite é 100MB no plano gratuito.");
    }

    console.error("❌ Erro inesperado no upload:", error);
    throw new Error("Erro ao fazer upload do arquivo.");
  } finally {
    // remove o arquivo local mesmo em caso de erro
    try {
      await fs.unlink(localFilePath);
    } catch (cleanupErr) {
      console.warn("⚠️ Falha ao deletar o arquivo local:", cleanupErr);
    }
  }
}
