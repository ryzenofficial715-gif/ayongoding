import { chatWithGroq } from './utils/groqClient.mjs';

const SYSTEM_PROMPT = `Kamu adalah AI Prompt Engineer senior yang ahli membuat prompt coding professional.

Tugas kamu: membuat prompt yang SANGAT lengkap dan profesional berdasarkan data project yang diberikan.

Prompt yang kamu buat HARUS:
1. Bisa dipakai di AI coding manapun (DeepSeek, Claude, Cursor, Bolt, v0, Codex)
2. Menghasilkan kode yang bagus, rapi, profesional, dan maksimal
3. Menggunakan Bahasa Indonesia yang jelas
4. Spesifik dan actionable — tidak ada kata-kata ambigu

STRUKTUR PROMPT WAJIB:
## ROLE
Kasih AI role yang jelas dan spesifik

## PROJECT OVERVIEW
Deskripsi project lengkap 2-3 paragraf

## TECH STACK
Stack yang harus dipakai (frontend, backend, database, library)

## FEATURES
Semua fitur detail dengan prioritas P0-P3

## USER FLOW
Alur penggunaan step by step

## UI/UX REQUIREMENTS
Warna, typography, animasi, responsive design

## DATABASE SCHEMA
Jika relevan — tabel, relasi, field

## API ENDPOINTS
Jika relevan — method, path, parameter, response

## TASK BREAKDOWN
Urutan pengerjaan dari awal sampai deploy

## OUTPUT FORMAT
Apa yang harus dihasilkan AI (full code, file structure, dsb)

## INSTRUKSI KHUSUS
- Jangan setengah-setengah
- Buat semua file sekaligus
- Kode harus production-ready
- Berikan penjelasan singkat di setiap file
- Gunakan best practice terbaru`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectData } = req.body;

    if (!projectData || !projectData.idea) {
      return res.status(400).json({ error: 'Data project tidak lengkap.' });
    }

    // Cek kalau semua field udah keisi
    let emptyFields = 0;
    for (const phase of projectData.phases || []) {
      for (const sub of phase.subfeatures || []) {
        for (const field of sub.fields || []) {
          if (!field.value || field.value.trim() === '') {
            emptyFields++;
          }
        }
      }
    }

    const promptForAI = `Buatkan prompt coding professional berdasarkan data project berikut:

IDE AWAL: ${projectData.idea}

DATA LENGKAP:
${JSON.stringify(projectData.phases, null, 2)}

Catatan: ${emptyFields > 0 ? `Ada ${emptyFields} field yang kosong — gunakan asumsi yang masuk akal.` : 'Semua field sudah terisi.'}`;

    const result = await chatWithGroq(promptForAI, SYSTEM_PROMPT, 6000);

    res.status(200).json({ 
      success: true, 
      prompt: result,
      emptyFieldsCount: emptyFields
    });
  } catch (err) {
    console.error('[generate Error]:', err.message);
    res.status(500).json({ error: err.message || 'Gagal generate prompt. Coba lagi.' });
  }
}
