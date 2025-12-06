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
      message: "Tamrini API v2.1 - Image Support",
      status: "online"
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question, language = 'en', history = [], image } = req.body || {};

  console.log('=== NEW REQUEST ===');
  console.log('Question:', question);
  console.log('Language:', language);
  console.log('Has Image:', !!image);
  console.log('Image length:', image ? image.length : 0);

  if (!question && !image) {
    res.status(400).json({ error: 'Question or image is required' });
    return;
  }

  const API_KEY = process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  // Use gemini-2.0-flash-exp for vision
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  const prompts = {
    en: `You are Tamrini, a friendly math tutor for students aged 12-18.

YOUR TASK:
1. If there's an image, CAREFULLY read and describe the math exercise you see
2. Identify the type of problem (equation, geometry, etc.)
3. Ask ONE guiding question to help the student solve it
4. NEVER give the direct answer

Keep your response to 3-5 sentences. Be encouraging!

Respond in English.`,

    fr: `Tu es Tamrini, un tuteur de maths sympa pour les élèves de 12-18 ans.

TA MISSION:
1. S'il y a une image, LIS ATTENTIVEMENT et décris l'exercice de maths que tu vois
2. Identifie le type de problème (équation, géométrie, etc.)
3. Pose UNE question pour guider l'élève
4. Ne donne JAMAIS la réponse directe

Limite ta réponse à 3-5 phrases. Sois encourageant!

Réponds en français.`,

    ar: `أنت تمريني، معلم رياضيات ودود للطلاب من 12-18 سنة.

مهمتك:
1. إذا كانت هناك صورة، اقرأ بعناية وصف تمرين الرياضيات الذي تراه
2. حدد نوع المسألة (معادلة، هندسة، إلخ)
3. اطرح سؤالاً واحداً لتوجيه الطالب
4. لا تعطي الإجابة المباشرة أبداً

اجعل ردك 3-5 جمل. كن مشجعاً!

أجب بالعربية.`
  };

  const systemPrompt = prompts[language] || prompts.en;

  // Build conversation
  let conversationText = '';
  if (history && history.length > 0) {
    history.slice(-6).forEach(function(m) {
      conversationText += (m.role === 'assistant' ? 'Tutor' : 'Student') + ': ' + m.content + '\n';
    });
  }

  try {
    let contents = [];

    if (image) {
      // ===== WITH IMAGE =====
      console.log('Processing image...');
      
      // Parse base64 image
      let base64Data = image;
      let mimeType = 'image/png';
      
      if (image.startsWith('data:')) {
        const regex = /^data:([^;]+);base64,(.+)$/;
        const matches = image.match(regex);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
          console.log('Image parsed - Type:', mimeType, 'Data length:', base64Data.length);
        } else {
          console.log('Failed to parse image data URL');
        }
      }

      const userMessage = question || 'Regarde cette image et aide-moi avec cet exercice';

      contents = [{
        parts: [
          {
            text: `${systemPrompt}

Previous conversation:
${conversationText}

Student says: ${userMessage}

[The student has shared an image of a math exercise. Look at the image carefully, describe what you see, and help them.]`
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      }];

    } else {
      // ===== TEXT ONLY =====
      console.log('Processing text only...');

      contents = [{
        parts: [{
          text: `${systemPrompt}

Previous conversation:
${conversationText}

Student: ${question}

Your response (guide them, don't give the answer):`
        }]
      }];
    }

    const requestBody = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
        topP: 0.9
      }
    };

    console.log('Calling Gemini API...');

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    console.log('Gemini status:', response.status);
    console.log('Gemini response:', JSON.stringify(data).substring(0, 500));

    if (!response.ok) {
      console.error('Gemini Error:', data);
      
      // If model not found, try alternative
      if (data.error?.message?.includes('not found')) {
        console.log('Trying alternative model...');
        
        // Try gemini-1.5-flash
        const altURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        
        const altResponse = await fetch(`${altURL}?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        
        const altData = await altResponse.json();
        console.log('Alt model response:', altResponse.status);
        
        if (altResponse.ok && altData.candidates?.[0]?.content?.parts?.[0]?.text) {
          res.status(200).json({ reply: altData.candidates[0].content.parts[0].text });
          return;
        }
      }
      
      res.status(500).json({
        error: 'Gemini error',
        details: data.error?.message || 'Unknown error'
      });
      return;
    }

    // Extract reply
    let reply = '';
    
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text) {
      reply = data.candidates[0].content.parts[0].text;
      console.log('Got reply:', reply.substring(0, 100));
    } else {
      console.log('No valid reply in response');
      console.log('Full response:', JSON.stringify(data));
    }

    // Only use fallback if really empty
    if (!reply || reply.trim() === '') {
      console.log('Using fallback response');
      const fallbacks = {
        en: "I can see your exercise! Could you type out the problem or tell me what part is confusing you?",
        fr: "Je vois ton exercice! Peux-tu me dire quel est le problème ou quelle partie te pose difficulté?",
        ar: "أرى تمرينك! هل يمكنك كتابة المسألة أو إخباري بالجزء الذي يصعب عليك؟"
      };
      reply = fallbacks[language] || fallbacks.en;
    }

    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error('Catch error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
