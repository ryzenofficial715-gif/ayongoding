import { chatWithGroq, cleanJSON } from './utils/groqClient.js';

const SYSTEM_PROMPT = `Kamu adalah AI Product Manager expert dengan pengalaman 15 tahun di perusahaan teknologi besar.

Tugas kamu: memecah ide project menjadi 5 fase pembangunan yang logis, terstruktur, dan profesional.

ATURAN WAJIB:
1. 5 fase harus urut dari perencanaan sampai maintenance
2. Setiap fase punya 5 sub-fitur yang relevan
3. Setiap sub-fitur punya 3 field yang spesifik dan actionable
4. Field harus bisa diisi user dengan jawaban singkat
5. Nama fase dan sub-fitur dalam Bahasa Indonesia
6. Output HARUS pure JSON, tidak boleh ada markdown, tidak boleh ada komentar

FORMAT JSON:
{
  "phases": [
    {
      "name": "Nama Fase",
      "description": "Deskripsi singkat maksimal 20 kata",
      "subfeatures": [
        {
          "name": "Nama Sub-fitur",
          "fields": ["Field 1", "Field 2", "Field 3"]
        }
      ]
    }
  ]
}`;

export default async function handler(req, res) {
  // CORS
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
