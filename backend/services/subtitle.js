// subtitle.js
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

// 🧠 Converte o conteúdo de um SRT para um array de legendas com start, end e texto
export function getSubtitlesFromSRT(srtContent) {
  const blocks = srtContent.split('\n\n');
  return blocks
    .map(block => {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const [start, end] = lines[1].split(' --> ').map(toSeconds);
        const text = lines.slice(2).join(' ');
        return { start, end, text };
      }
    })
    .filter(Boolean);
}

// 🔄 Converte um tempo SRT (hh:mm:ss,ms) para segundos
function toSeconds(timeStr) {
  const [hms, ms] = timeStr.split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s + Number(ms) / 1000;
}

// 📝 Gera SRT a partir de um array de legendas
export function generateSRT(segments) {
  return segments.map((segment, index) => {
    const formatTime = (seconds) => {
      const date = new Date(0);
      date.setSeconds(seconds);
      return date.toISOString().substr(11, 8) + ',' + String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
    };

    return `${index + 1}
${formatTime(segment.start)} --> ${formatTime(segment.end)}
${segment.text || ''}

`;
  }).join('\n');
}

export function parseSRT(srtContent) {
  const entries = srtContent
    .split('\n\n')
    .map(block => {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
        if (!timeMatch) return null;

        const start = timeMatch[1].replace(',', '.');
        const end = timeMatch[2].replace(',', '.');
        const text = lines.slice(2).join(' ').replace(/\s+/g, ' ').trim();

        return { start, end, text };
      }
      return null;
    })
    .filter(Boolean);

  return entries;
}

// ✂️ Função para cortar os vídeos com base nos segmentos
export async function generateVideoCuts(videoPath, cuts) {
  const outputDir = path.resolve('cuts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  let index = 1;
  for (const cut of cuts) {
    const start = cut.start ?? cut.inicio;
    const end = cut.end ?? cut.fim;
    const duration = end - start;

    if (!start || !end || duration <= 0) {
      console.warn(`⚠️ Corte inválido ignorado:`, cut);
      continue;
    }

    const outputPath = path.join(outputDir, `cut_${index}.mp4`);
    try {
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .setStartTime(start)
          .setDuration(duration)
          .output(outputPath)
          .on('end', () => {
            console.log(`✅ Corte ${index} salvo: ${outputPath}`);
            resolve();
          })
          .on('error', (err) => {
            console.error(`❌ Erro no corte ${index}:`, err.message);
            reject(err);
          })
          .run();
      });
    } catch (err) {
      console.error('Erro ao gerar corte:', err.message);
    }

    index++;
  }

  console.log('🚀 Todos os cortes foram gerados com sucesso!');
}
