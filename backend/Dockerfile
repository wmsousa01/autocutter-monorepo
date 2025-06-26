# Usa uma imagem Node.js oficial
FROM node:18-alpine

# Cria e define o diretório de trabalho
WORKDIR /app

# Copia os arquivos package.json e lock (caso use npm ou yarn)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o restante do projeto
COPY . .

# Expõe a porta que seu app usa
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
