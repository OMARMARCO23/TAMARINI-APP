const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function askTamrini(question, language = 'en', conversationHistory = []) {
  
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

${languageInstructions[language]}

EXAMPLE INTERACTION:
Student: "What is 2x + 5 = 15?"
You: "Great question! Let's solve this together. First, what do you think we should do to isolate x? What's on the left side that we could move? 🤔"

CONVERSATION SO FAR:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

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
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
