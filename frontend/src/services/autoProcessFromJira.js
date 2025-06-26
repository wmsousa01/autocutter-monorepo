import axios from 'axios';
import { downloadVideo } from './downloadVideo';
import { generateCuts } from './generateCuts';
import { uploadToGoogleDrive } from './uploadToGoogleDrive';
import { createSubtask } from './createSubtask';

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY; // SP ou PFDC
const JIRA_AUTH_EMAIL = process.env.JIRA_AUTH_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const CUSTOM_FIELD_YOUTUBE_URL = 'customfield_10223'; // ID real do campo personalizado

const authHeader = {
  Authorization:
    'Basic ' + Buffer.from(`${JIRA_AUTH_EMAIL}:${JIRA_API_TOKEN}`).toString('base64'),
  Accept: 'application/json',
};

async function getReadyIssues() {
  const jql = `project = ${JIRA_PROJECT_KEY} AND status = "Pronto para Cortes" AND ${CUSTOM_FIELD_YOUTUBE_URL} is not EMPTY`;
  const url = `${JIRA_BASE_URL}/rest/api/3/search?jql=${encodeURIComponent(jql)}`;

  const response = await axios.get(url, { headers: authHeader });
  return response.data.issues;
}

export async function autoProcessFromJira() {
  const issues = await getReadyIssues();

  for (const issue of issues) {
    const youtubeUrl = issue.fields[CUSTOM_FIELD_YOUTUBE_URL];
    const issueKey = issue.key;

    console.log(`🎬 Processando episódio: ${youtubeUrl} (Tarefa: ${issueKey})`);

    try {
      // Baixar episódio completo
      const localPath = await downloadVideo(youtubeUrl);

      // Gerar cortes (retorna [{ title, description, path }])
      const cuts = await generateCuts(localPath);

      for (const cut of cuts) {
        // Upload do corte
        const driveUrl = await uploadToGoogleDrive(cut.path);

        // Criar subtask no Jira
        await createSubtask(issueKey, {
          summary: cut.title,
          description: `${cut.description}\n\n🔗 Link do vídeo: ${driveUrl}`,
        });
      }

      console.log(`✅ Cortes gerados e subtasks criadas para: ${issueKey}`);
    } catch (error) {
      console.error(`❌ Erro ao processar ${issueKey}:`, error.message);
    }
  }
}
