import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { downloadVideo } from '../services/downloadVideo.js';
import { transcribeAudio } from '../services/transcribe.js';
import { generateCuts } from '../services/generateCuts.js';
import { transcribeCuts } from '../services/transcribeCuts.js';

const router = express.Router();

// Corrigir __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para limpar a pasta uploads
function clearUploadsFolder() {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    fs.readdirSync(uploadsDir).forEach(file => {
      fs.unlinkSync(path.join(uploadsDir, file));
    });
  }
}

router.post('/process', async (req, res) => {
  try {
    const { youtubeUrl } = req.body;
    if (!youtubeUrl) return res.status(400).send('URL do vídeo não fornecida');

    // 🧹 Limpar a pasta uploads antes de começar
    clearUploadsFolder();

    const outputPath = path.join(__dirname, '..', 'uploads', 'video.mkv');

    // Baixar o vídeo
    const videoPath = await downloadVideo(youtubeUrl, outputPath);
    console.log('✅ Vídeo baixado em:', videoPath);

    // Transcrever o vídeo
    const { txtPath, srtPath, jsonPath } = await transcribeAudio(videoPath);
    console.log('✅ Transcrição concluída:', { txtPath, srtPath, jsonPath });

    // Validar caminhos
    if (!fs.existsSync(srtPath)) {
      throw new Error(`❌ Arquivo SRT não encontrado: ${srtPath}`);
    }
    if (!fs.existsSync(videoPath)) {
      throw new Error(`❌ Arquivo de vídeo não encontrado: ${videoPath}`);
    }

    // Gerar cortes com base na transcrição
    await generateCuts({ srtPath, videoPath });

    res.status(200).send('✅ Processamento completo');
  } catch (error) {
    console.error('Erro ao processar:', error);
    res.status(500).send(`Erro ao processar: ${error.message}`);
  }
});

router.post('/transcribe-cuts', async (req, res) => {
  try {
    await transcribeCuts();
    res.status(200).send('✅ Transcrição dos cortes concluída.');
  } catch (error) {
    console.error('Erro ao transcrever cortes:', error);
    res.status(500).send(`Erro ao transcrever cortes: ${error.message}`);
  }
});

router.get('/cuts', async (req, res) => {
  try {
    const cutsDir = path.join(__dirname, '..', 'cuts');
    const transcriptionsDir = path.join(__dirname, '..', 'transcriptions');

    const files = fs.readdirSync(cutsDir).filter(file => file.endsWith('.mp4'));

    const cuts = files.map(file => {
      const cutName = path.parse(file).name; // ex: cut_1
      const videoUrl = `/cuts/${file}`;
      const transcriptionPath = path.join(transcriptionsDir, `${cutName}.txt`);

      let transcription = '';
      if (fs.existsSync(transcriptionPath)) {
        transcription = fs.readFileSync(transcriptionPath, 'utf-8');
      }

      return {
        url: videoUrl,
        title: cutName,
        transcription,
      };
    });

    res.json({ cuts });
  } catch (err) {
    console.error('Erro ao listar cortes:', err);
    res.status(500).json({ error: 'Erro ao listar cortes' });
  }
});


export default router;
