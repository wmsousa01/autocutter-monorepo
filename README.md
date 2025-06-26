# 🎬 Autocutter

**Autocutter** é uma ferramenta de corte automático de vídeos longos do YouTube, desenvolvida em Node.js.  
Ela identifica os melhores trechos com base na transcrição do conteúdo e gera cortes entre **7 e 15 minutos** automaticamente, prontos para redes sociais ou canais de cortes.

---

## 🛠️ Funcionalidades

- 🔽 **Download de vídeos** via `yt-dlp`
- 🧠 **Transcrição offline** com `whisper.cpp` e modelo local
- 🪄 **Detecção semântica de tópicos** com **LLM local (LLaMA3 via Ollama)**
- ✂️ **Geração de cortes** automáticos com `ffmpeg`
- 📄 Gera arquivos `.txt`, `.srt` e `.json` com a transcrição

---

## 🧩 Tecnologias Utilizadas

- Node.js (ESM)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp)
- [ffmpeg](https://ffmpeg.org/)
- [Ollama](https://ollama.com/) (LLaMA 3 model)

---

## 🚀 Como Usar

### Pré-requisitos:

- Node.js v18+
- yt-dlp instalado globalmente
- ffmpeg instalado
- whisper compilado localmente
- Ollama instalado com o modelo `llama3` já carregado (`ollama pull llama3`)

### Passo a passo:

```bash
# Instale as dependências
npm install

# Execute o servidor
node server.js
 .

 ## 🧠 Download do modelo Whisper

Para funcionar, você precisa baixar o modelo `.bin` manualmente:

1. Acesse: https://huggingface.co/ggerganov/whisper.cpp
2. Baixe o modelo `ggml-base.bin`
3. Salve na pasta: `./models/`
