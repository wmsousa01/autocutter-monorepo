// backend/services/uploadToFirebase.js
import bucket from '../firebase.js';
import path from 'path';

export async function uploadVideo(localPath, destName) {
  await bucket.upload(localPath, {
    destination: `videos/${destName}`,
    metadata: {
      contentType: 'video/mp4'
    }
  });

  // Gera URL pública
  const file = bucket.file(`videos/${destName}`);
  await file.makePublic();

  return file.publicUrl();
}
