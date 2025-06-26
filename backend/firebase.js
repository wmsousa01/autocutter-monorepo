// backend/firebase.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./firebase-adminsdk.json'));

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'gs://autocutter-7bc9b.firebasestorage.app'
});

const bucket = getStorage().bucket();

export default bucket;
