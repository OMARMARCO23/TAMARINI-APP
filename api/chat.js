export default async function handler(req, res) {
  // ===== CORS HEADERS =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      message: "Tamrini API is working!",
      version: "2.0 - Image Support",
      usage: "POST /api/chat with { question, language, history, image }"
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question, language = 'en', history = [], image } = req.body || {};

  if (!question && !image) {
    res.status(400).json({ error: 'Question or image is required' });
    return;
  }

  const API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  // Use Gemini 1.5 Flash for vision (supports images)
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  // System prompts per language
  const prompts = {
    en: `You are Tamrini, a friendly math tutor for students aged 12-18.

IMPORTANT RULES:
- NEVER give the direct answer immediately
- If there's an image, first describe what math problem you see
- Ask ONE guiding question to help them think
- Keep responses SHORT (2-4 sentences max)
- Be encouraging and friendly
- Use simple language

If an image is provided, analyze the math exercise in the image and help the student solve it step by step.

Respond in English.`,

    fr: `Tu es Tamrini, un tuteur de maths sympa pour les élèves de 12-18 ans.

RÈGLES IMPORTANTES:
- Ne JAMAIS donner la réponse directement
- S'il y a une image, décris d'abord le problème de maths que tu vois
- Pose UNE question pour guider l'élève
- Réponses COURTES (2-4 phrases max)
- Sois encourageant et sympa
- Utilise un langage simple

Si une image est fournie, analyse l'exercice de maths dans l'image et aide l'élève à le résoudre étape par étape.

Réponds en français.`,

    ar: `أنت تمريني، معلم رياضيات ودود للطلاب من 12-18 سنة.

القواعد المهمة:
- لا تعطي الإجابة المباشرة أبداً
- إذا كانت هناك صورة، صف أولاً مسألة الرياضيات التي تراها
- اطرح سؤالاً واحداً لتوجيه الطالب
- إجابات قصيرة (2-4 جمل كحد أقصى)
- كن مشجعاً وودوداً
- استخدم لغة بسيطة

إذا تم تقديم صورة، حلل تمرين الرياضيات في الصورة وساعد الطالب على حله خطوة بخطوة.

أجب بالعربية.`
  };

  const systemPrompt = prompts[language] || prompts.en;

  // Build conversation history text
  let conversationText = '';
  if (history && history.length > 0) {
    history.forEach(function(m) {
      const role = m.role === 'assistant' ? 'Tutor' : 'Student';
      conversationText += role + ': ' + m.content + '\n';
    });
  }

  try {
    let requestBody;

    if (image) {
      // ===== REQUEST WITH IMAGE =====
      console.log('Processing image request...');
      
      // Extract base64 data from data URL
      let base64Data = image;
      let mimeType = 'image/png';
      
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      const fullPrompt = `${systemPrompt}

CONVERSATION SO FAR:
${conversationText}

Student's message: ${question || 'Please help me with this exercise'}

Look at the image and help the student. Remember: guide them, don't give the answer directly.`;

      requestBody = {
        contents: [{
          parts: [
            { text: fullPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      };

    } else {
      // ===== TEXT ONLY REQUEST =====
      console.log('Processing text request...');

      const fullPrompt = `${systemPrompt}

CONVERSATION SO FAR:
${conversationText}

Student: ${question}

Your response (remember: guide, don't give answers directly):`;

      requestBody = {
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      };
    }

    console.log('Calling Gemini API...');

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    console.log('Gemini response status:', response.status);

    if (!response.ok) {
      console.error('Gemini Error:', JSON.stringify(data));
      res.status(500).json({
        error: 'Gemini error',
        details: data.error?.message || 'Unknown error'
      });
      return;
    }

    // Extract reply
    let reply = '';
    try {
      if (data.candidates && 
          data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        reply = data.candidates[0].content.parts[0].text;
      }
    } catch (e) {
      console.error('Parse error:', e);
    }

    // Fallback if no reply
    if (!reply || reply.trim() === '') {
      const fallbacks = {
        en: "I can see your exercise! Could you tell me what part you're having trouble with?",
        fr: "Je vois ton exercice! Quelle partie te pose problème?",
        ar: "أرى تمرينك! ما الجزء الذي تواجه صعوبة فيه؟"
      };
      reply = fallbacks[language] || fallbacks.en;
    }

    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
