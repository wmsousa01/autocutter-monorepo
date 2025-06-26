import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateCuts({ srtPath, videoPath }) {
  if (!videoPath) {
    throw new Error('❌ Caminho do vídeo não fornecido.');
  }

  const outputDir = path.join(__dirname, '..', 'cuts');
  const publicCutsDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'cuts');

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(publicCutsDir, { recursive: true });

  console.log('⏳ Obtendo duração total do vídeo...');
  const duration = await getVideoDuration(videoPath);

  const segmentLength = 600; // 10 minutos
  const totalCuts = Math.ceil(duration / segmentLength);

  const promises = [];

  for (let i = 0; i < totalCuts; i++) {
    const start = i * segmentLength;
    const end = Math.min((i + 1) * segmentLength, duration);
    const cutDuration = end - start;

    const outputFile = path.join(outputDir, `cut_${i + 1}.mp4`);
    const publicCopy = path.join(publicCutsDir, `cut_${i + 1}.mp4`);

    const promise = new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(start)
        .setDuration(cutDuration)
        .output(outputFile)
        .on('end', async () => {
          try {
            await fs.copyFile(outputFile, publicCopy);
            console.log(`✅ Corte ${i + 1} salvo: ${outputFile}`);
            console.log(`📤 Copiado para public/cuts: cut_${i + 1}.mp4`);
            resolve();
          } catch (copyErr) {
            reject(copyErr);
          }
        })
        .on('error', (err) => {
          console.error(`❌ Erro no corte ${i + 1}:`, err.message);
          reject(err);
        })
        .run();
    });

    promises.push(promise);
  }

  await Promise.all(promises);
  console.log('🚀 Todos os cortes foram gerados com sucesso!');
}

function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(videoPath)
      .ffprobe((err, metadata) => {
        if (err) {
          return reject(err);
        }
        resolve(metadata.format.duration);
      });
  });
}
