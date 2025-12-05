export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET (for testing)
  if (req.method === 'GET') {
    return res.status(200).json({
      message: "Tamrini API is working!",
      usage: "POST /api/chat with { question, language }"
    });
  }

  // Handle POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, language = 'en', history = [] } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const langText = {
    en: 'Respond in English.',
    fr: 'Réponds en français.',
    ar: 'أجب باللغة العربية.',
  };

  const prompt = `
You are Tamrini, a friendly math tutor for students aged 12-18.

RULES:
- NEVER give direct answers
- Ask guiding questions
- Break problems into steps
- Encourage the student
- Use simple language
- Use emojis occasionally 😊

${langText[language] || langText.en}

History: ${JSON.stringify(history)}

Student: ${question}

Your response:`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
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
