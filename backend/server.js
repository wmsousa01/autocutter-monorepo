// server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { FRONTEND_URL } from './config.js';

import cutsRoute from './routes/cuts.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: FRONTEND_URL,
}));
app.use(express.json());

// Servir arquivos estáticos da pasta cuts
const cutsPath = path.resolve(__dirname, 'cuts');
app.use('/cuts', express.static(cutsPath));

// Rotas
app.use('/api', cutsRoute);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend está rodando 🎉' });
});

// ✅ Exportar app para testes
export default app;

// ✅ Só inicia o servidor se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  });
}
