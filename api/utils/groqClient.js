import axios from 'axios';

const GROQ_API_KEY = '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';

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
        model: 'llama-3.1-8b-instant',
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
        timeout: 90000
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
    if (err.response?.status === 503) {
      throw new Error('Server Groq sedang sibuk. Coba lagi dalam 1 menit.');
    }
    if (err.code === 'ECONNABORTED') {
      throw new Error('AI timeout. Coba lagi dengan ide yang lebih singkat.');
    }
    throw new Error('Gagal menghubungi Groq API: ' + err.message);
  }
}

export function cleanJSON(text) {
  let cleaned = text || '';
  
  // Hapus markdown code blocks
  cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '');
  
  // Hapus teks sebelum { pertama dan sesudah } terakhir
  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');
  
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }
  
  return cleaned.trim();
}
