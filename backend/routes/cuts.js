// routes/cuts.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cutsDir = path.resolve(__dirname, '..', 'cuts');

router.get('/cuts', async (req, res) => {
  try {
    const files = await fs.readdir(cutsDir);
    const metas = files.filter(f => f.endsWith('.meta.json'));

    const results = [];

    for (const file of metas) {
      const filePath = path.join(cutsDir, file);
      const raw = await fs.readFile(filePath, 'utf-8');

      try {
        const meta = JSON.parse(raw);
        results.push(meta);
      } catch (err) {
        console.warn(`⚠️ Erro ao processar ${file}: ${err.message}`);
      }
    }

    res.json({ cuts: results });
  } catch (error) {
    console.error('❌ Erro ao listar cortes:', error.message);
    res.status(500).json({ error: 'Erro ao listar cortes' });
  }
});

export default router;
