import { getAuth } from '@clerk/nextjs/server';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
  const { userId } = getAuth(request);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), {
      status: 401,
    });
  }

  try {
    const results = await cloudinary.v2.search
      .expression(`folder:autocutter/${userId} AND resource_type:video`)
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    const cuts = results.resources.map((file) => ({
      filename: file.public_id.split('/').pop() + '.' + file.format,
      title: file.public_id.split('/').pop(),
      description: '',
      duration: file.duration,
      status: 'done',
      url: file.secure_url,
    }));

    return new Response(JSON.stringify(cuts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar no Cloudinary:', error);
    return new Response(JSON.stringify({ error: 'Falha ao carregar cortes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
