import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const KEY_PATH = path.resolve(process.cwd(), 'src/config/google-service-account.json');

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

export async function uploadToGoogleDrive(filePath) {
  try {
    const drive = google.drive({ version: 'v3', auth });
    const fileName = path.basename(filePath);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Folder compartilhada
    };

    const media = {
      mimeType: 'video/mp4',
      body: fs.createReadStream(filePath),
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    const fileId = res.data.id;

    // Torna o vídeo público
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const publicUrl = `https://drive.google.com/file/d/${fileId}/view`;
    console.log(`☁️ Vídeo disponível em: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('❌ Erro no upload para o Google Drive:', error.message);
    throw error;
  }
}
