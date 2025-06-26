export function extractJsonFromText(text) {
  if (typeof text !== 'string') throw new Error('❌ modelOutput inválido: não é uma string.');

  try {
    const matchBlocks = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/g)];
    
    if (matchBlocks.length > 0) {
      for (const match of matchBlocks) {
        try {
          return JSON.parse(match[1]);
        } catch {
          continue;
        }
      }
    }

    // Fallback: tenta encontrar um bloco JSON fora do markdown
    const fallbackMatch = text.match(/(\{[\s\S]*?\}|\[[\s\S]*?\])/);
    if (fallbackMatch) {
      try {
        return JSON.parse(fallbackMatch[0]);
      } catch (e) {
        throw new Error(`❌ JSON malformado no fallback: ${e.message}`);
      }
    }

    throw new Error('❌ Nenhum bloco JSON válido encontrado.');
  } catch (err) {
    throw new Error(`❌ Erro ao extrair JSON: ${err.message}`);
  }
}


export function parseSRT(srtContent) {
  const blocks = srtContent.trim().split('\n\n');
  return blocks.map((block) => {
    const lines = block.split('\n');
    if (lines.length < 2) return null;

    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s-->\s(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) return null;

    const start = secondsFromSRTTime(timeMatch[1]);
    const end = secondsFromSRTTime(timeMatch[2]);
    const text = lines.slice(2).join(' ');

    return { start, end, text };
  }).filter(Boolean); // remove nulls
}

export function secondsFromSRTTime(time) {
  if (typeof time !== 'string') {
    throw new TypeError(`Invalid time format: ${time}`);
  }

  const [hours, minutes, rest] = time.split(':');
  const [seconds, millis] = rest.split(',');

  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseInt(millis) / 1000
  );
}

export function mergeShortSegments(segments, minDuration = 420) {
  const merged = [];
  let current = null;

  for (const segment of segments) {
    if (!current) {
      current = { ...segment };
    } else if ((segment.end - current.start) < minDuration) {
      current.end = segment.end;
      current.text += ' ' + segment.text;
    } else {
      merged.push(current);
      current = { ...segment };
    }
  }

  if (current) merged.push(current);
  return merged;
}
