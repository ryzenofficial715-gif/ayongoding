import axios from 'axios';

const GROQ_API_KEY = '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';

/**
 * Kirim chat ke Groq API
 * @param {string} prompt - Pesan user
 * @param {string} systemPrompt - Instruksi sistem
 * @param {number} maxTokens - Maksimal token output
 * @returns {Promise<string>} - Teks hasil dari AI
 */
export async function chatWithGroq(prompt, systemPrompt = '', maxTokens = 4096) {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (res.data?.choices?.[0]?.message?.content) {
      return res.data.choices[0].message.content;
    }
    throw new Error('Respons AI kosong');
  } catch (err) {
    console.error('[Groq Error]:', err.message);
    if (err.response?.status === 401) {
      throw new Error('Token Groq invalid. Cek API key di console.groq.com');
    }
    if (err.response?.status === 429) {
      throw new Error('Rate limit Groq tercapai. Tunggu beberapa saat lalu coba lagi.');
    }
    if (err.code === 'ECONNABORTED') {
      throw new Error('Timeout. AI butuh waktu lebih lama, coba lagi.');
    }
    throw new Error('Gagal menghubungi Groq API: ' + err.message);
  }
}

/**
 * Bersihkan JSON dari AI yang mungkin ada markdown/teks ekstra
 */
export function cleanJSON(text) {
  // Hapus markdown code blocks
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '');
  
  // Coba cari JSON object/array pertama
  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');
  
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }
  
  return cleaned.trim();
}
