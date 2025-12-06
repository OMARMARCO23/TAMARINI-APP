export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ message: "Tamrini API v2.5" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, language = 'en', history = [], image } = req.body || {};

  if (!question && !image) {
    return res.status(400).json({ error: 'Question or image required' });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // ===== USE GEMINI 2.5 FLASH =====
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

  // ===== SHORTER PROMPTS = LESS TOKENS =====
  const prompts = {
    en: `You are Tamrini, a math tutor. Rules:
- If image: describe the math problem briefly
- Never give direct answers
- Ask ONE guiding question
- Keep response under 3 sentences
Respond in English.`,

    fr: `Tu es Tamrini, tuteur de maths. Règles:
- Si image: décris brièvement le problème
- Ne donne jamais la réponse directe
- Pose UNE question pour guider
- Maximum 3 phrases
Réponds en français.`,

    ar: `أنت تمريني، معلم رياضيات. القواعد:
- إذا صورة: صف المسألة باختصار
- لا تعطي الإجابة مباشرة
- اطرح سؤالاً واحداً
- 3 جمل كحد أقصى
أجب بالعربية.`
  };

  const systemPrompt = prompts[language] || prompts.en;

  // ===== SHORTER HISTORY = LESS TOKENS =====
  let conversationText = '';
  if (history && history.length > 0) {
    // Only use last 4 messages instead of 6
    history.slice(-4).forEach(m => {
      const role = m.role === 'assistant' ? 'T' : 'S';
      // Truncate long messages
      const content = m.content.substring(0, 150);
      conversationText += `${role}: ${content}\n`;
    });
  }

  try {
    let parts = [];

    const promptText = `${systemPrompt}

${conversationText}
Student: ${question || 'Help with this exercise'}`;

    // Handle image
    if (image) {
      let imageData = image;
      let mimeType = 'image/png';

      if (image.includes('base64,')) {
        const splitParts = image.split('base64,');
        if (splitParts.length === 2) {
          imageData = splitParts[1];
          const mimeMatch = image.match(/data:([^;]+);/);
          if (mimeMatch) mimeType = mimeMatch[1];
        }
      }

      parts = [
        { text: promptText },
        { inlineData: { mimeType: mimeType, data: imageData } }
      ];
    } else {
      parts = [{ text: promptText }];
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200  // Reduced from 500
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      return res.status(500).json({
        error: 'Gemini error',
        details: data.error?.message || 'Unknown'
      });
    }

    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!reply) {
      const fallbacks = {
        en: "Can you type the exercise? I'll help you solve it.",
        fr: "Peux-tu écrire l'exercice? Je t'aiderai à le résoudre.",
        ar: "هل يمكنك كتابة التمرين؟ سأساعدك في حله."
      };
      reply = fallbacks[language] || fallbacks.en;
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
