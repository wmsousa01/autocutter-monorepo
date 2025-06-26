import { autoProcessFromJira } from '@/services/autoProcessFromJira';

export async function POST(req) {
  try {
    const body = await req.json();

    // Verifica se o status mudou para "Pronto para Cortes"
    const newStatus = body?.issue?.fields?.status?.name;
    if (newStatus !== 'Pronto para Cortes') {
      return new Response('Ignorado. Status diferente.', { status: 200 });
    }

    console.log(`🚀 Webhook recebido do Jira para: ${body.issue.key}`);
    await autoProcessFromJira();

    return new Response('Processamento iniciado.', { status: 200 });
  } catch (err) {
    console.error('❌ Erro no webhook:', err);
    return new Response('Erro interno.', { status: 500 });
  }
}
