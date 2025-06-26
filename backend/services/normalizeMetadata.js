import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Corrigido para apontar para 'services/metadata'
const metadataDir = path.resolve(__dirname, 'metadata')
const files = fs.readdirSync(metadataDir).filter(f => f.endsWith('.meta.json'))

files.forEach(file => {
  const filePath = path.join(metadataDir, file)
  const raw = fs.readFileSync(filePath, 'utf-8')

  try {
    const json = JSON.parse(raw)

    let { title, description } = json

    if (description) {
      // Tenta extrair o título da descrição
      const titleMatch = description.match(/\*\*Título:\*\*\s*(.+)/i)

      if (titleMatch) {
        title = titleMatch[1].trim()
        description = description.replace(/\*\*Título:\*\*\s*.+/i, '').trim()
      }
    }

    const normalized = { title, description }

    fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), 'utf-8')
    console.log(`✅ Corrigido: ${file}`)
  } catch (err) {
    console.error(`❌ Erro ao processar ${file}:`, err.message)
  }
})
