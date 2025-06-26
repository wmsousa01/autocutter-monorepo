import axios from 'axios';

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_AUTH_EMAIL = process.env.JIRA_AUTH_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

const authHeader = {
  Authorization:
    'Basic ' + Buffer.from(`${JIRA_AUTH_EMAIL}:${JIRA_API_TOKEN}`).toString('base64'),
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export async function createSubtask(parentIssueKey, { summary, description }) {
  try {
    const response = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          summary,
          description,
          issuetype: { name: 'Sub-task' },
          parent: { key: parentIssueKey },
          project: { key: parentIssueKey.split('-')[0] },
        },
      },
      { headers: authHeader }
    );

    console.log(`✅ Subtask criada: ${response.data.key}`);
    return response.data.key;
  } catch (error) {
    console.error('❌ Erro ao criar subtask:', error.response?.data || error.message);
    throw error;
  }
}
