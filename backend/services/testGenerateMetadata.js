import path from 'path'
import { fileURLToPath } from 'url'
import { generateAndSaveMetadata } from './generateHeadlines.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Altere aqui para o nome do corte que deseja testar
const baseName = 'cut_1'

// Caminho do .txt da transcrição
const txtPath = path.resolve(__dirname, '..', 'transcriptions', 'cuts', `${baseName}.txt`)

// Diretório onde será salvo o .meta.json
const metaDir = path.resolve(__dirname, '..', 'metadata')

await generateAndSaveMetadata(baseName, txtPath, metaDir)
