export default async function handler(req, res) {
  // ==== CORS ====
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

  // ===== MODEL FALLBACK ORDER =====
  // You can change the order or remove models you don't want to use.
  const MODEL_ORDER = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];

  // ===== PROMPTS =====
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

  // ===== SHORTER HISTORY =====
  let conversationText = '';
  if (history && history.length > 0) {
    history.slice(-4).forEach(m => {
      const role = m.role === 'assistant' ? 'T' : 'S';
      const content = (m.content || '').substring(0, 150);
      conversationText += `${role}: ${content}\n`;
    });
  }

  try {
    // Build prompt + parts (with optional image)
    const promptText = `${systemPrompt}

${conversationText}
Student: ${question || 'Help with this exercise'}`;

    let parts = [];

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

    // ===== CALL GEMINI WITH FALLBACK =====
    const { data, modelUsed } = await callGeminiWithFallback({
      apiKey: API_KEY,
      models: MODEL_ORDER,
      parts
    });

    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!reply) {
      const fallbacks = {
        en: "Can you type the exercise? I'll help you solve it.",
        fr: "Peux-tu écrire l'exercice? Je t'aiderai à le résoudre.",
        ar: "هل يمكنك كتابة التمرين؟ سأساعدك في حله."
      };
      reply = fallbacks[language] || fallbacks.en;
    }

    // You can return modelUsed for debugging if you like
    return res.status(200).json({ reply, model: modelUsed });

  } catch (error) {
    console.error('Server error:', error);
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message || 'Server error',
      code: error.code || null
    });
  }
}

/**
 * Try calling Gemini models in order.
 * If a model returns a quota / 429 error, try the next one.
 * If a model returns another error, stop and throw.
 */
async function callGeminiWithFallback({ apiKey, models, parts }) {
  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 200
  };

  let lastError = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error(`Failed to parse Gemini response for ${model}`, e);
        const err = new Error('Invalid response from Gemini API');
        err.status = 502;
        throw err;
      }

      if (response.ok && !data.error) {
        // Success
        console.log(`Gemini call succeeded with model: ${model}`);
        return { data, modelUsed: model };
      }

      const status = response.status;
      const code = data.error?.status || null;
      const message = data.error?.message || 'Gemini API error';

      const msgLower = (message || '').toLowerCase();
      const isQuotaError =
        status === 429 ||
        code === 'RESOURCE_EXHAUSTED' ||
        msgLower.includes('quota') ||
        msgLower.includes('rate limit') ||
        msgLower.includes('too many requests');

      if (isQuotaError) {
        console.warn(`Quota error for model ${model}, trying next model if available...`, message);
        lastError = { status, code, message };
        // Continue loop to try the next model
        continue;
      }

      // Non-quota error: stop here
      console.error(`Non-quota error for model ${model}:`, message);
      const err = new Error(message);
      err.status = status;
      err.code = code;
      throw err;

    } catch (err) {
      // Network or parse-level error
      console.error(`Error calling Gemini model ${model}:`, err);
      lastError = {
        status: err.status || 500,
        code: err.code || null,
        message: err.message || 'Gemini API error'
      };
      // For network errors you might want to *not* try the next model,
      // but here we just break to avoid cascading.
      break;
    }
  }

  // If we got here, all models failed
  const error = new Error(lastError?.message || 'Gemini API error');
  error.status = lastError?.status || 502;
  error.code = lastError?.code || null;
  throw error;
}
