import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export const splitAudio = (inputPath, outputDir, segmentLength = 900) => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });

    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);

      const duration = metadata.format.duration;
      const segments = Math.ceil(duration / segmentLength);
      const outputPaths = [];

      let completed = 0;

      for (let i = 0; i < segments; i++) {
        const outputPath = path.join(outputDir, `segment_${i}.wav`);
        outputPaths.push(outputPath);

        ffmpeg(inputPath)
          .setStartTime(i * segmentLength)
          .setDuration(segmentLength)
          .output(outputPath)
          .on('end', () => {
            completed++;
            if (completed === segments) resolve(outputPaths);
          })
          .on('error', reject)
          .run();
      }
    });
  });
};
