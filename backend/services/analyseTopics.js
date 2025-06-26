// services/analyseTopics.js
import fs from 'fs/promises';
import path from 'path';
import { extractJsonFromText } from './utils.js';

/**
 * Divide a transcrição em blocos de texto com base no tempo total e no tamanho do conteúdo.
 * Cada bloco será de aproximadamente 7 a 15 minutos.
 */
function groupSubtitlesIntoBlocks(subtitles, maxDuration = 900) {
  const blocks = [];
  let currentBlock = [];
  let currentStart = 0;
  let currentEnd = 0;

  for (const subtitle of subtitles) {
    const duration = subtitle.end - currentStart;
    currentBlock.push(subtitle);
    currentEnd = subtitle.end;

    if (duration >= maxDuration) {
      blocks.push({ start: currentStart, end: currentEnd, subtitles: currentBlock });
      currentBlock = [];
      currentStart = subtitle.end;
    }
  }

  if (currentBlock.length > 0) {
    blocks.push({ start: currentStart, end: currentEnd, subtitles: currentBlock });
  }

  return blocks;
}

/**
 * Envia o conteúdo de um bloco para o modelo e tenta extrair os cortes.
 */
async function analyzeBlockWithModel(text, attempt = 1) {
  const prompt = `
A partir da transcrição abaixo, identifique os tópicos principais e crie cortes de vídeo com base nessas mudanças de tópico. Cada corte deve conter:
- "start": início do corte em segundos
- "end": fim do corte em segundos
- "description": uma breve descrição do tópico

Responda **apenas** com um array JSON chamado "cuts". Exemplo:
[
  { "start": 0, "end": 450, "description": "Introdução ao tema" },
  { "start": 451, "end": 890, "description": "Discussão sobre causas" }
]

Transcrição:
${text}
`;

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false,
    }),
  });

  const { response: modelOutput } = await response.json();
  const extracted = extractJsonFromText(modelOutput);

  if (Array.isArray(extracted)) {
    return extracted;
  }

  console.warn('⚠️ Falha ao extrair JSON estruturado do modelo. Retorno textual capturado:');
  console.log(modelOutput);
  return null;
}

/**
 * Analisa a transcrição por tópicos e retorna os cortes propostos.
 */
export async function findHotTopicsFromTranscript(subtitles) {
  const blocks = groupSubtitlesIntoBlocks(subtitles);
  const allCuts = [];

  for (const block of blocks) {
    const blockText = block.subtitles.map((s) => s.text).join(' ');
    const cuts = await analyzeBlockWithModel(blockText);

    if (cuts && Array.isArray(cuts)) {
      allCuts.push(...cuts);
    } else {
      console.warn('🟨 Nenhum corte válido encontrado neste bloco.');
    }
  }

  return allCuts;
}
