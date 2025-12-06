export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ message: "Tamrini API v2.2" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, language = 'en', history = [], image } = req.body || {};

  console.log('--- NEW REQUEST ---');
  console.log('Question:', question);
  console.log('Language:', language);
  console.log('Has image:', !!image);

  if (!question && !image) {
    return res.status(400).json({ error: 'Question or image required' });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompts = {
    en: `You are Tamrini, a math tutor. If there's an image, describe the math problem you see. Never give direct answers. Ask guiding questions. Keep responses short (2-4 sentences). Respond in English.`,
    fr: `Tu es Tamrini, tuteur de maths. S'il y a une image, décris le problème de maths. Ne donne jamais la réponse directe. Pose des questions pour guider. Réponses courtes (2-4 phrases). Réponds en français.`,
    ar: `أنت تمريني معلم رياضيات. إذا كانت هناك صورة، صف المسألة. لا تعطي الإجابة مباشرة. اطرح أسئلة توجيهية. إجابات قصيرة. أجب بالعربية.`
  };

  const systemPrompt = prompts[language] || prompts.en;

  let conversationText = '';
  if (history && history.length > 0) {
    history.slice(-6).forEach(m => {
      conversationText += (m.role === 'assistant' ? 'Tutor' : 'Student') + ': ' + m.content + '\n';
    });
  }

  try {
    let parts = [];
    let model = 'gemini-2.5-flash';

    // Build prompt text
    const promptText = `${systemPrompt}

Conversation:
${conversationText}

Student: ${question || 'Help me with this exercise image'}

Your response:`;

    // Handle image
    if (image) {
      console.log('Processing image...');
      
      let imageData = image;
      let mimeType = 'image/png';

      // Parse data URL
      if (image.includes('base64,')) {
        const parts = image.split('base64,');
        if (parts.length === 2) {
          imageData = parts[1];
          
          // Get mime type
          const mimeMatch = image.match(/data:([^;]+);/);
          if (mimeMatch) {
            mimeType = mimeMatch[1];
          }
        }
      }

      console.log('Image type:', mimeType);
      console.log('Image data length:', imageData.length);

      parts = [
        { text: promptText },
        {
          inlineData: {
            mimeType: mimeType,
            data: imageData
          }
        }
      ];
    } else {
      parts = [{ text: promptText }];
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    console.log('Calling Gemini:', model);

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    const data = await response.json();
    console.log('Gemini status:', response.status);

    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      return res.status(500).json({
        error: 'Gemini error',
        details: data.error?.message || 'Unknown'
      });
    }

    // Get reply
    let reply = '';
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
      console.log('Reply:', reply.substring(0, 100));
    } else {
      console.log('No reply found in:', JSON.stringify(data).substring(0, 300));
    }

    if (!reply) {
      return res.status(200).json({
        reply: language === 'fr' 
          ? "Je n'arrive pas à lire l'image. Peux-tu écrire l'exercice?" 
          : language === 'ar'
          ? "لم أتمكن من قراءة الصورة. هل يمكنك كتابة التمرين؟"
          : "I couldn't read the image. Can you type the exercise?"
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
