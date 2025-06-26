import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';

export async function convertCutToWav(inputPath, outputDir) {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.wav`);

  await fs.mkdir(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-ar 16000', '-ac 1'])
      .toFormat('wav')
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}
