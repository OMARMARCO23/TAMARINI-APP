export default async function handler(req, res) {
  // ===== CORS HEADERS - MUST BE FIRST =====
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

  var body = req.body || {};
  var question = body.question;
  var language = body.language || 'en';
  var history = body.history || [];

  if (!question) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  var API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  var API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  // System prompts per language
  var prompts = {
    en: "You are Tamrini, a math tutor for students aged 12-18. RULES: 1) NEVER give direct answers. 2) Ask ONE guiding question at a time. 3) Keep responses SHORT (2-3 sentences). 4) Be encouraging but not excessive. 5) Use simple language. Respond in English.",
    fr: "Tu es Tamrini, un tuteur de maths pour les élèves de 12-18 ans. RÈGLES: 1) Ne JAMAIS donner la réponse directe. 2) Pose UNE question guidée à la fois. 3) Réponses COURTES (2-3 phrases). 4) Sois encourageant. 5) Langage simple. Réponds en français.",
    ar: "أنت تمريني، معلم رياضيات للطلاب من 12-18 سنة. القواعد: 1) لا تعطي الإجابة مباشرة أبداً. 2) اطرح سؤالاً توجيهياً واحداً. 3) إجابات قصيرة (2-3 جمل). 4) كن مشجعاً. 5) لغة بسيطة. أجب بالعربية."
  };

  var systemPrompt = prompts[language] || prompts.en;

  // Build conversation
  var conversationText = '';
  history.forEach(function(m) {
    conversationText += m.role + ': ' + m.content + '\n';
  });

  var fullPrompt = systemPrompt + '\n\nCONVERSATION:\n' + conversationText + '\nUSER: ' + question + '\n\nRESPONSE:';

  try {
    var response = await fetch(API_URL + '?key=' + API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300
        }
      })
    });

    var data = await response.json();

    if (!response.ok) {
      console.error('Gemini Error:', data);
      res.status(500).json({
        error: 'Gemini error',
        details: data.error ? data.error.message : 'Unknown error'
      });
      return;
    }

    var reply = 'No response';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      reply = data.candidates[0].content.parts[0].text;
    }

    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
