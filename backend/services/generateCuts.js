import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadVideo } from './uploadToFirebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateCuts({ srtPath, videoPath }) {
  if (!videoPath) {
    throw new Error('❌ Caminho do vídeo não fornecido.');
  }

  const outputDir = path.join(__dirname, '..', 'cuts');
  await fs.mkdir(outputDir, { recursive: true });

  console.log('⏳ Obtendo duração total do vídeo...');
  const duration = await getVideoDuration(videoPath);

  const segmentLength = 600; // 10 minutos
  const totalCuts = Math.ceil(duration / segmentLength);

  const cutMetadata = [];

  for (let i = 0; i < totalCuts; i++) {
    const start = i * segmentLength;
    const end = Math.min((i + 1) * segmentLength, duration);
    const cutDuration = end - start;

    const cutName = `cut_${i + 1}.mp4`;
    const localPath = path.join(outputDir, cutName);

    console.log(`🎬 Gerando corte ${i + 1}: ${start}s → ${end}s`);

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(start)
        .setDuration(cutDuration)
        .output(localPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    console.log(`📁 Corte salvo localmente: ${localPath}`);

    const publicUrl = await uploadVideo(localPath, cutName);

    const meta = {
      title: `Corte ${i + 1}`,
      description: `Trecho entre ${start}s e ${end}s`,
      start,
      end,
      url: publicUrl,
    };

    const metaPath = path.join(outputDir, `cut_${i + 1}.meta.json`);
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
    console.log(`📝 Metadata salva em: ${metaPath}`);

    cutMetadata.push(meta);
    console.log(`✅ Corte ${i + 1} enviado com sucesso: ${publicUrl}`);
  }

  console.log('🚀 Todos os cortes foram gerados, enviados e salvos com metadados!');
  return cutMetadata;
}

function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(videoPath)
      .ffprobe((err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration);
      });
  });
}
