import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateAndSaveMetadata } from './generateHeadlines.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const transcriptionsDir = path.resolve(__dirname, '..', 'transcriptions', 'cuts')
const metadataDir = path.resolve(__dirname, '..', 'metadata')

// Garante que a pasta metadata existe
if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir, { recursive: true })

const files = fs.readdirSync(transcriptionsDir).filter(f => f.endsWith('.txt'))

for (const file of files) {
  const base = path.basename(file, '.txt')
  const metaPath = path.join(metadataDir, `${base}.meta.json`)

  // Pula se o metadata já existir
  if (fs.existsSync(metaPath)) {
    console.log(`⏭️ Metadata já existe para ${base}, pulando...`)
    continue
  }

  const transcriptPath = path.join(transcriptionsDir, file)

  try {
    console.log(`🚀 Gerando metadata para ${base}...`)
    await generateAndSaveMetadata(base, transcriptPath, metadataDir)
  } catch (err) {
    console.error(`❌ Erro ao gerar metadata para ${base}:`, err.message)
  }
}
