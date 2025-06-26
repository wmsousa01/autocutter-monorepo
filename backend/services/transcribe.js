import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process';
import { generateSRT } from './subtitle.js';

const CHUNK_DURATION = 15 * 60; // 15 minutos em segundos

export const transcribeAudio = async (filePath) => {
  const wavPath = filePath.endsWith('.wav') ? filePath : filePath.replace(path.extname(filePath), '.wav');

  if (!filePath.endsWith('.wav')) {
    await convertToWav(filePath, wavPath);
  }

  const duration = await getAudioDuration(wavPath);
  const chunks = Math.ceil(duration / CHUNK_DURATION);
  const finalSegments = [];

  for (let i = 0; i < chunks; i++) {
    const chunkPath = wavPath.replace('.wav', `_chunk${i}.wav`);
    await extractChunk(wavPath, chunkPath, i * CHUNK_DURATION, CHUNK_DURATION);

    const jsonTempPath = chunkPath.replace('.wav', '.json');
    await runWhisperCommand(chunkPath);

    if (!fs.existsSync(jsonTempPath)) {
      throw new Error(`❌ JSON não gerado para o chunk ${chunkPath}`);
    }

    const segmentData = JSON.parse(fs.readFileSync(jsonTempPath, 'utf-8'));
    if (!segmentData || !Array.isArray(segmentData.transcription)) {
      throw new Error(`❌ Estrutura JSON inválida em ${jsonTempPath}`);
    }

    const segments = segmentData.transcription.map(s => ({
      start: (s.offsets?.from || 0) / 1000,
      end: (s.offsets?.to || 0) / 1000,
      text: s.text || ''
    }));

    finalSegments.push(
      ...segments.map(s => ({
        ...s,
        start: s.start + i * CHUNK_DURATION,
        end: s.end + i * CHUNK_DURATION
      }))
    );

    fs.unlinkSync(chunkPath);
    fs.unlinkSync(jsonTempPath);
  }

  const baseName = path.basename(filePath, path.extname(filePath));
  const transcriptionDir = path.resolve('transcriptions');
  if (!fs.existsSync(transcriptionDir)) fs.mkdirSync(transcriptionDir);

  const txtPath = path.join(transcriptionDir, `${baseName}.txt`);
  const srtPath = path.join(transcriptionDir, `${baseName}.srt`);

  fs.writeFileSync(txtPath, finalSegments.map(s => s.text).join(' '), 'utf8');
  fs.writeFileSync(srtPath, generateSRT(finalSegments), 'utf8');

  return {
    txtPath,
    srtPath,
    jsonPath: null // ou undefined, apenas para manter consistência no retorno
  };
};

// 🔧 Funções auxiliares

const convertToWav = (inputPath, outputPath) => new Promise((resolve, reject) => {
  ffmpeg(inputPath)
    .outputOptions(['-ar 16000', '-ac 1'])
    .toFormat('wav')
    .on('end', () => resolve(outputPath))
    .on('error', reject)
    .save(outputPath);
});

const getAudioDuration = (filePath) => new Promise((resolve, reject) => {
  ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) reject(err);
    else resolve(metadata.format.duration);
  });
});

const extractChunk = (inputPath, outputPath, start, duration) => new Promise((resolve, reject) => {
  ffmpeg(inputPath)
    .seekInput(start)
    .duration(duration)
    .outputOptions(['-ar 16000', '-ac 1'])
    .toFormat('wav')
    .on('end', () => resolve(outputPath))
    .on('error', reject)
    .save(outputPath);
});

const runWhisperCommand = (chunkPath) => new Promise((resolve, reject) => {
  const outputPrefix = chunkPath.replace(/\.wav$/, '');
  const cmd = `./whisper.cpp/build/bin/whisper-cli -l auto -m ./models/ggml-base.bin -f "${chunkPath}" --output-json --output-file "${outputPrefix}"`;

  console.log('🎙️ Executando Whisper:', cmd);

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('[ERRO WHISPER]', stderr);
      reject(stderr);
    } else {
      resolve(stdout);
    }
  });
});
