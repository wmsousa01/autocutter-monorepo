// frontend/src/services/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCuts() {
  const res = await fetch(`${API_BASE_URL}/api/cuts`);
  return res.json();
}

export async function processVideo(youtubeUrl) {
  const res = await fetch(`${API_BASE_URL}/api/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ youtubeUrl }),
  });
  return res.json();
}
