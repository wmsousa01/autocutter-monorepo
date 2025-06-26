import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs/promises';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegPath);

// Duração padrão: 5 minutos (em segundos)
const CHUNK_DURATION = 300;

export async function splitVideo(inputPath, outputFolder = 'uploads/splits') {
  await fs.mkdir(outputFolder, { recursive: true });

  const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration);
      });
    });
  };

  const duration = await getVideoDuration(inputPath);
  const chunks = Math.ceil(duration / CHUNK_DURATION);
  const outputPaths = [];

  const splitPromises = Array.from({ length: chunks }).map((_, index) => {
    const startTime = index * CHUNK_DURATION;
    const outputPath = path.join(outputFolder, `cut_${index}.webm`);
    outputPaths.push(outputPath);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(CHUNK_DURATION)
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  });

  await Promise.all(splitPromises);
  return outputPaths;
}
