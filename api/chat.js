export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET request (for testing in browser)
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: "Tamrini API is working! Use POST to chat.",
      usage: "POST /api/chat with {question, language}"
    });
  }

  // Handle POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, language = 'en', history = [] } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  const languageInstructions = {
    en: 'Respond in English.',
    fr: 'Réponds en français.',
    ar: 'أجب باللغة العربية.',
  };

  const systemPrompt = `
You are Tamrini, a friendly and encouraging math tutor for students aged 12-18.

YOUR RULES:
1. NEVER give direct answers to math problems
2. Ask guiding questions to help students think
3. Break problems into smaller steps
4. Celebrate small wins and encourage them
5. Use simple, age-appropriate language
6. If they're stuck, give gentle hints
7. Use emojis occasionally to be friendly 😊

${languageInstructions[language] || languageInstructions.en}

EXAMPLE INTERACTION:
Student: "What is 2x + 5 = 15?"
You: "Great question! Let's solve this together. First, what do you think we should do to isolate x? What's on the left side that we could move? 🤔"

CONVERSATION SO FAR:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n') || 'New conversation'}

STUDENT'S NEW MESSAGE:
${question}

YOUR HELPFUL RESPONSE:
`;

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      return res.status(500).json({ error: 'Gemini API request failed' });
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to get response' });
  }
}
