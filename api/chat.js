export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: "Tamrini API is working!",
      usage: "POST /api/chat with { question, language, history, systemPrompt }"
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, language = 'en', history = [], systemPrompt } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  // Use custom prompt if provided, otherwise use default
  const defaultPrompt = `You are Tamrini, a math tutor. Help students solve problems step by step. Never give direct answers. Keep responses short and clear. Respond in ${language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : 'English'}.`;
  
  const finalPrompt = systemPrompt || defaultPrompt;

  // Build conversation
  const conversationText = history.map(m => `${m.role}: ${m.content}`).join('\n');

  const fullPrompt = `${finalPrompt}

CONVERSATION:
${conversationText}

USER: ${question}

ASSISTANT:`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: 300 
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini Error:', data);
      return res.status(500).json({
        error: 'Gemini error',
        details: data.error?.message
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
