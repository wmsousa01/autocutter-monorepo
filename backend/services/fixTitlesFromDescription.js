import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const metadataDir = path.resolve(__dirname, 'metadata')
const files = fs.readdirSync(metadataDir).filter(file => file.endsWith('.meta.json'))

files.forEach(file => {
  const fullPath = path.join(metadataDir, file)
  const raw = fs.readFileSync(fullPath, 'utf-8')
  const json = JSON.parse(raw)

  const currentTitle = json.title?.trim()
  const description = json.description || ''

  // Captura formatos diversos de título
  const match =
    description.match(/\*\*Título(?: chamativo)?:\*\*\s*(.+)/i) || // Markdown com **
    description.match(/Título(?: chamativo)?:\s*"([^"]+)"/i) ||    // Título: "abc"
    description.match(/"([^"]{10,})"/)                              // Primeiro texto entre aspas com mais de 10 caracteres

  if (match && match[1]) {
    const newTitle = match[1].trim()
    if (newTitle !== currentTitle) {
      json.title = newTitle
      fs.writeFileSync(fullPath, JSON.stringify(json, null, 2), 'utf-8')
      console.log(`✅ Título ajustado: ${file}`)
    }
  } else {
    console.warn(`⚠️ Título não encontrado na descrição: ${file}`)
  }
})
