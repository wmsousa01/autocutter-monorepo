import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';
import { convertCutToWav } from './convertCutToWav.js'; // importe aqui

const execAsync = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cutsDir = path.join(__dirname, '..', 'cuts');
const outputDir = path.join(__dirname, '..', 'transcriptions', 'cuts');
const whisperPath = path.join(__dirname, '..', 'whisper.cpp', 'build', 'bin', 'whisper-cli');
const modelPath = path.join(__dirname, '..', 'models', 'ggml-base.bin');

await fs.mkdir(outputDir, { recursive: true });

export async function transcribeCuts() {
  try {
    const files = await fs.readdir(cutsDir);
    const cuts = files.filter(file => file.endsWith('.mp4'));

    for (const cut of cuts) {
      const inputPath = path.join(cutsDir, cut);
      const wavPath = await convertCutToWav(inputPath, outputDir);
      const baseName = path.basename(wavPath, '.wav');
      const outputPath = path.join(outputDir, baseName);

      console.log(`🎙️ Transcrevendo corte: ${cut}`);

      const command = `"${whisperPath}" -l auto -m "${modelPath}" -f "${wavPath}" --output-json --output-srt --output-txt --output-file "${outputPath}"`;

      const { stdout, stderr } = await execAsync(command);
      console.log(stdout);
      if (stderr) console.error(stderr);

      console.log(`✅ Transcrição gerada para: ${cut}`);
    }

    console.log('🚀 Transcrição de todos os cortes concluída.');
  } catch (err) {
    console.error('❌ Erro na transcrição dos cortes:', err.message);
  }
}
