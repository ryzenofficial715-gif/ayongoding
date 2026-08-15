import { chatWithGroq, cleanJSON } from './utils/groqClient.js';

const SYSTEM_PROMPT = `Kamu AI Product Manager. Pecah ide jadi 5 fase, tiap fase 5 sub-fitur, tiap sub-fitur 3 field.

Output JSON:
{"phases":[{"name":"...","description":"...","subfeatures":[{"name":"...","fields":["...","...","..."]}]}]}`;

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
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(200).json({
        success: false,
        error: 'Ide harus minimal 10 karakter. Jelaskan lebih detail ya.'
      });
    }

    const prompt = `Pecah ide project berikut menjadi 5 fase:\n\n${idea.trim()}`;

    const result = await chatWithGroq(prompt, SYSTEM_PROMPT, 800);
    const cleaned = cleanJSON(result);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[Parse Error]:', cleaned.substring(0, 300));
      return res.status(200).json({
        success: false,
        error: 'AI menghasilkan format tidak valid. Coba lagi.'
      });
    }

    if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
      return res.status(200).json({
        success: false,
        error: 'Gagal memecah fase. Coba lagi.'
      });
    }

    res.status(200).json({ success: true, phases: parsed.phases });
  } catch (err) {
    console.error('[break-phases Error]:', err.message);
    res.status(200).json({
      success: false,
      error: err.message || 'Gagal memproses ide. Coba lagi.'
    });
  }
}  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(200).json({ 
        success: false, 
        error: 'Ide harus minimal 10 karakter. Jelaskan lebih detail ya.' 
      });
    }

    const prompt = `Pecah ide project berikut menjadi 5 fase pembangunan:\n\n${idea.trim()}`;
    
    const result = await chatWithGroq(prompt, SYSTEM_PROMPT, 3000);
    const cleaned = cleanJSON(result);
    
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[Parse Error]:', cleaned.substring(0, 300));
      return res.status(200).json({ 
        success: false, 
        error: 'AI menghasilkan format tidak valid. Coba lagi dengan ide yang lebih spesifik.' 
      });
    }

    if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
      return res.status(200).json({ 
        success: false, 
        error: 'Gagal memecah fase. Coba lagi dengan deskripsi yang lebih detail.' 
      });
    }

    // Validasi struktur minimal
    for (const phase of parsed.phases) {
      if (!phase.name || !phase.subfeatures || !Array.isArray(phase.subfeatures)) {
        return res.status(200).json({ 
          success: false, 
          error: 'Struktur fase tidak lengkap. Coba lagi.' 
        });
      }
    }

    res.status(200).json({ success: true, phases: parsed.phases });
  } catch (err) {
    console.error('[break-phases Error]:', err.message);
    res.status(200).json({ 
      success: false, 
      error: err.message || 'Gagal memproses ide. Coba lagi.' 
    });
  }
}
