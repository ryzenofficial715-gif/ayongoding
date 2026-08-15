import { chatWithGroq } from './utils/groqClient.js';

const SYSTEM_PROMPT = `Kamu AI Prompt Engineer. Buat prompt coding professional dari data project.

Struktur: ROLE, PROJECT OVERVIEW, TECH STACK, FEATURES, USER FLOW, UI/UX, TASK BREAKDOWN, OUTPUT FORMAT, INSTRUKSI KHUSUS.`;

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
      return res.status(200).json({
        success: false,
        error: 'Data project tidak lengkap.'
      });
    }

    let emptyFields = 0;
    let totalFields = 0;

    for (const phase of projectData.phases || []) {
      for (const sub of phase.subfeatures || []) {
        for (const field of sub.fields || []) {
          totalFields++;
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

Catatan: ${emptyFields > 0 ? `Ada ${emptyFields} dari ${totalFields} field yang kosong — gunakan asumsi yang masuk akal.` : 'Semua field sudah terisi.'}`;

    const result = await chatWithGroq(promptForAI, SYSTEM_PROMPT, 1500);

    res.status(200).json({
      success: true,
      prompt: result,
      emptyFieldsCount: emptyFields,
      totalFieldsCount: totalFields
    });
  } catch (err) {
    console.error('[generate Error]:', err.message);
    res.status(200).json({
      success: false,
      error: err.message || 'Gagal generate prompt. Coba lagi.'
    });
  }
}
