import request from 'supertest';
import app from '../../server.js'; // certifique-se que exporta o app

describe('GET /api/cuts', () => {
  it('deve retornar lista de cortes', async () => {
    const res = await request(app).get('/api/cuts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
