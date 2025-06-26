export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getAuth } from '@clerk/nextjs/server';
import cloudinary from 'cloudinary';
import { downloadVideo } from '@/services/downloadVideo.js';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary'; // opcional, não usado aqui

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const formData = await req.formData();
    const youtubeUrl = formData.get('youtubeUrl');
    const file = formData.get('file');

    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    if (!youtubeUrl && !file) {
      return NextResponse.json({ error: 'Nada enviado' }, { status: 400 });
    }

    let localPath, filename;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      filename = file.name;
      localPath = path.join(uploadsDir, filename);
      await fs.writeFile(localPath, buffer);
      console.log('✅ Arquivo salvo:', localPath);
    }

    if (youtubeUrl) {
      console.log('🎬 Baixando com serviço downloadVideo.js...');
      const videoPath = await downloadVideo(youtubeUrl);
      localPath = videoPath;
      filename = path.basename(videoPath);
    }

    if (!localPath || !filename) {
      return NextResponse.json({ error: 'Erro ao processar vídeo' }, { status: 500 });
    }

    console.log('📂 Uploadando arquivo:', localPath);

    try {
      const cloudinaryRes = await cloudinary.v2.uploader.upload_large(localPath, {
        resource_type: 'video',
        folder: `autocutter/${userId}`,
        public_id: path.parse(filename).name,
        chunk_size: 6_000_000,
      });

      console.log('☁️ Upload para Cloudinary:', cloudinaryRes.secure_url);

      return NextResponse.json({ success: true, url: cloudinaryRes.secure_url });
    } catch (error) {
      if (error.http_code === 400 && error.message?.includes("File size too large")) {
        return NextResponse.json({
          error: 'Arquivo excede o limite de 100MB no plano gratuito do Cloudinary.',
        }, { status: 413 });
      }
      throw error;
    } finally {
      try {
        await fs.unlink(localPath);
      } catch (cleanupErr) {
        console.warn("⚠️ Falha ao deletar o arquivo local:", cleanupErr);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }
}
