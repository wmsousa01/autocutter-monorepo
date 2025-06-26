import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { readdirSync, unlinkSync } from 'fs';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const downloadVideo = (youtubeUrl) => {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const baseName = 'video';
    const outputTemplate = path.join(uploadsDir, `${baseName}.%(ext)s`);

    try {
      const oldFiles = readdirSync(uploadsDir);
      oldFiles.forEach(file => {
        if (file.startsWith(baseName)) {
          unlinkSync(path.join(uploadsDir, file));
        }
      });
    } catch (e) {
      console.warn('⚠️ Erro ao limpar uploads:', e.message);
    }

    const command = `yt-dlp -f "bv*+ba/best" -o "${outputTemplate}" ${youtubeUrl}`;
    console.log('Executando comando:', command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Erro ao baixar vídeo:', stderr || error);
        return reject(`Erro ao baixar vídeo: ${stderr || error.message}`);
      }

      const files = readdirSync(uploadsDir);
      const downloadedFile = files.find(file => file.startsWith(baseName + '.'));

      if (!downloadedFile) {
        return reject('Arquivo de vídeo não encontrado após o download.');
      }

      const finalPath = path.join(uploadsDir, downloadedFile);
      console.log('✅ Vídeo baixado em:', finalPath);
      resolve(finalPath);
    });
  });
};
