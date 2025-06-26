export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    // 🔍 Buscar todos os vídeos do usuário na pasta autocutter/userId
    const { resources } = await cloudinary.v2.api.resources({
      type: 'upload',
      prefix: `autocutter/${userId}`,
      resource_type: 'video',
      max_results: 100,
    });

    for (const resource of resources) {
      await cloudinary.v2.uploader.destroy(resource.public_id, {
        resource_type: 'video',
      });
      console.log('🗑️ Cloudinary:', resource.public_id);
    }

    // 🧹 Apagar .meta.json correspondentes
    const metaDir = path.resolve(process.cwd(), '..', 'backend/services/metadata');
    const metaFiles = await fs.readdir(metaDir);
    for (const file of metaFiles) {
      if (file.endsWith('.meta.json')) {
        const fullPath = path.join(metaDir, file);
        await fs.unlink(fullPath);
        console.log('🧾 .meta.json deletado:', file);
      }
    }

    // 🧹 Apagar arquivos locais em uploads/
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const localFiles = await fs.readdir(uploadsDir);
    for (const file of localFiles) {
      const filePath = path.join(uploadsDir, file);
      await fs.unlink(filePath);
      console.log('🧹 Local removido:', filePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao deletar todos os cortes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
