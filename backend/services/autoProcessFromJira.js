import axios from 'axios';
import { downloadVideo } from '@/services/downloadVideo';
import { generateCuts } from '@/services/generateCuts';
import { uploadToGoogleDrive } from '@/services/googleDrive';
import { createSubtask } from '@/services/jira';

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
const JIRA_AUTH_TOKEN = process.env.JIRA_AUTH_TOKEN;
const CUSTOM_FIELD_YOUTUBE_URL = 'customfield_episodio_url'; // configure isso no Jira

async function getReadyIssues() {
  const jql = `project = ${JIRA_PROJECT_KEY} AND status = "Pronto para Cortes" AND ${CUSTOM_FIELD_YOUTUBE_URL} is not EMPTY`;
  const response = await axios.get(\`\${JIRA_BASE_URL}/rest/api/3/search?jql=\${encodeURIComponent(jql)}\`, {
    headers: {
      'Authorization': \`Basic \${JIRA_AUTH_TOKEN}\`,
      'Accept': 'application/json'
    }
  });

  return response.data.issues;
}

export async function autoProcessFromJira() {
  const issues = await getReadyIssues();

  for (const issue of issues) {
    const youtubeUrl = issue.fields[CUSTOM_FIELD_YOUTUBE_URL];
    const issueKey = issue.key;

    console.log(\`🎬 Processando episódio: \${youtubeUrl} (Tarefa: \${issueKey})\`);

    try {
      const localPath = await downloadVideo(youtubeUrl);
      const cuts = await generateCuts(localPath);

      for (const cut of cuts) {
        const driveUrl = await uploadToGoogleDrive(cut.path);
        await createSubtask(issueKey, {
          summary: cut.title,
          description: `${cut.description}\n\n🔗 Link do vídeo: ${driveUrl}`,
        });
      }

      console.log(\`✅ Cortes gerados e subtasks criadas para: \${issueKey}\`);
    } catch (error) {
      console.error(\`❌ Erro ao processar \${issueKey}:\`, error);
    }
  }
}
