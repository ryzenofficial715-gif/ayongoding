import { MimoAI } from './utils/mimoClient.mjs';

const SYSTEM_PROMPT = `Kamu adalah AI Product Manager expert. Pecah ide berikut jadi PRD lengkap dalam bahasa Indonesia.

Format output wajib:
# PRD: [Nama Produk]

## 1. Ringkasan Produk
[Jelaskan dalam 3-4 kalimat]

## 2. Target Pengguna
| Persona | Pain Points | Kebutuhan Utama |
|---------|-------------|-----------------|

## 3. Fitur Utama
| Prioritas | Fitur | Deskripsi | Estimasi |
|-----------|-------|-----------|----------|

## 4. User Flow
1. langkah 1
2. langkah 2
...

## 5. Arsitektur Teknis
- Frontend:
- Backend:
- Database:
- Infrastruktur:

## 6. Task Breakdown
| # | Task | Prioritas | Estimasi |
|---|------|-----------|----------|

## 7. Monetisasi (opsional)

## 8. Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
|--------|--------|----------|`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (req.method !== 'POST') {
    res.write(`data: ${JSON.stringify({ error: 'Method not allowed' })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  const { idea } = req.body;
  if (!idea) {
    res.write(`data: ${JSON.stringify({ error: 'Ide tidak boleh kosong' })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  const prompt = `${SYSTEM_PROMPT}\n\nIDE DARI USER:\n${idea}`;
  const client = new MimoAI();

  try {
    await client.sendMessage({
      prompt,
      model: 'deepseek/deepseek-v4-pro',
      messages: [],
      onStream: (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
