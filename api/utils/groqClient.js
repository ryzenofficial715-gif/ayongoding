import axios from 'axios';

const GROQ_API_KEY = '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';

export async function chatWithGroq(prompt, systemPrompt = '', maxTokens = 1000) {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const models = ['llama-3.2-3b-preview', 'llama-3.1-8b-instant', 'gemma2-9b-it'];

  let lastError = null;

  for (const model of models) {
    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
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
          timeout: 20000
        }
      );

      const content = res.data?.choices?.[0]?.message?.content;
      if (content && content.length > 30) {
        return content;
      }
      lastError = new Error('Respons terlalu pendek');
    } catch (err) {
      lastError = err;
      console.error(`[${model} Error]:`, err.message);
    }
  }

  throw new Error(lastError?.message || 'Semua model gagal');
}

export function cleanJSON(text) {
  let cleaned = text || '';
  cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '');
  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }
  return cleaned.trim();
}
