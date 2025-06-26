// test-read-meta.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const metadataDir = path.resolve(__dirname, '..', 'metadata')

console.log('📁 Pasta de metadados:', metadataDir)

const files = fs.readdirSync(metadataDir)
console.log('📄 Arquivos encontrados:', files)

for (const file of files) {
  const content = fs.readFileSync(path.join(metadataDir, file), 'utf-8')
  console.log(`🧾 ${file}:\n`, content.slice(0, 300), '\n')
}
