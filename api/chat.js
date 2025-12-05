export default async function handler(req, res) {
  // ===== CORS HEADERS =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ===== HANDLE PREFLIGHT =====
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ===== HANDLE GET =====
  if (req.method === 'GET') {
    res.status(200).json({
      message: "Tamrini API is working!",
      usage: "POST /api/chat with { question, language, history }"
    });
    return;
  }

  // ===== HANDLE POST =====
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question, language = 'en', history = [] } = req.body || {};

  if (!question) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  const API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  // System prompts per language
  const prompts = {
    en: `You are Tamrini, a friendly math tutor for students aged 12-18.

IMPORTANT RULES:
- NEVER give the direct answer
- Ask ONE guiding question to help them think
- Keep responses SHORT (2-3 sentences max)
- Be encouraging but natural
- Use simple language

Example:
Student: "What is 2x + 5 = 15?"
You: "Good question! To find x, we need to isolate it. What operation would you do first to get rid of the +5?"

Respond in English.`,

    fr: `Tu es Tamrini, un tuteur de maths sympa pour les élèves de 12-18 ans.

RÈGLES IMPORTANTES:
- Ne JAMAIS donner la réponse directe
- Pose UNE question pour les guider
- Réponses COURTES (2-3 phrases max)
- Sois encourageant mais naturel
- Utilise un langage simple

Exemple:
Élève: "Combien fait 2x + 5 = 15?"
Toi: "Bonne question! Pour trouver x, on doit l'isoler. Quelle opération ferais-tu d'abord pour enlever le +5?"

Réponds en français.`,

    ar: `أنت تمريني، معلم رياضيات ودود للطلاب من 12-18 سنة.

القواعد المهمة:
- لا تعطي الإجابة المباشرة أبداً
- اطرح سؤالاً واحداً لتوجيههم
- إجابات قصيرة (2-3 جمل كحد أقصى)
- كن مشجعاً بشكل طبيعي
- استخدم لغة بسيطة

مثال:
الطالب: "كم يساوي 2x + 5 = 15؟"
أنت: "سؤال جيد! لإيجاد x، نحتاج لعزله. ما العملية التي ستفعلها أولاً للتخلص من +5؟"

أجب بالعربية.`
  };

  const systemPrompt = prompts[language] || prompts.en;

  // Build conversation history
  let conversationText = '';
  if (history && history.length > 0) {
    history.forEach(function(m) {
      const role = m.role === 'assistant' ? 'Tutor' : 'Student';
      conversationText += role + ': ' + m.content + '\n';
    });
  }

  const fullPrompt = `${systemPrompt}

CONVERSATION SO FAR:
${conversationText}
Student: ${question}

Your response (remember: guide, don't give answers):`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: fullPrompt }] 
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300
        }
      })
    });

    const data = await response.json();

    // Log for debugging
    console.log('Gemini raw response:', JSON.stringify(data));

    if (!response.ok) {
      console.error('Gemini Error:', data);
      res.status(500).json({
        error: 'Gemini error',
        details: data.error?.message || 'Unknown error'
      });
      return;
    }

    // Extract reply from response
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
        en: "I'm here to help! Could you tell me more about the problem you're working on?",
        fr: "Je suis là pour t'aider! Peux-tu m'en dire plus sur le problème?",
        ar: "أنا هنا للمساعدة! هل يمكنك إخباري المزيد عن المسألة؟"
      };
      reply = fallbacks[language] || fallbacks.en;
    }

    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
