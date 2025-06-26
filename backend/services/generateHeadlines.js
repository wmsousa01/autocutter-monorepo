import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const transcriptionsDir = path.resolve(__dirname, '..', 'transcriptions', 'cuts')
const metadataDir = path.resolve(__dirname, '..', 'metadata')

// Garante que o diretório metadata existe
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true })
}

console.log('📂 Pasta de transcrições:', transcriptionsDir)
console.log('📂 Pasta de metadados:', metadataDir)

const files = fs.readdirSync(transcriptionsDir).filter(file => file.endsWith('.txt'))
console.log('📄 Arquivos encontrados:', files)

export async function generateAndSaveMetadata(baseName, txtPath, metaDir) {
  try {
    const transcript = fs.readFileSync(txtPath, 'utf-8')

    const prompt = `
Com base na transcrição abaixo de um corte de podcast, gere um título chamativo e uma descrição curta (no máximo 2 parágrafos) para o YouTube Shorts. Ao final, adicione um link para o episódio completo: https://www.youtube.com/watch?v=VYLoKSCBVlw

Responda apenas no formato Markdown abaixo:

**Título:** <seu título aqui>

<descrição aqui>

---

Transcrição:
"""${transcript}"""
`

    const result = spawnSync('ollama', ['run', 'llama3'], {
      input: prompt,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10,
    })

    const output = result.stdout?.trim()

    if (!output) {
      console.warn(`⚠️ Modelo não retornou saída para ${baseName}`)
      return
    }

    console.log(`🧠 Resposta do modelo para ${baseName}:\n${output}\n`)

    const titleMatch = output.match(/\*\*Título:\*\*\s*(.+)/i)
    const descriptionMatch = output.replace(/\*\*Título:\*\*.+/i, '').trim()

    const metadata = {
      title: titleMatch ? titleMatch[1].trim() : baseName,
      description: descriptionMatch,
    }

    const outputPath = path.join(metaDir, `${baseName}.meta.json`)
    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8')
    console.log(`✅ Metadata gerada para ${baseName} → ${baseName}.meta.json`)
  } catch (err) {
    console.error(`❌ Erro ao gerar metadata para ${baseName}:`, err.message)
  }
}

// 🟢 Execução principal
for (const file of files) {
  const baseName = path.basename(file, '.txt')
  const txtPath = path.join(transcriptionsDir, file)
  await generateAndSaveMetadata(baseName, txtPath, metadataDir)
}
