import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

export function initializeGemini() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }
  return model!;
}

export async function generateContent(prompt: string): Promise<string> {
  const model = initializeGemini();
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate content from AI');
  }
}

export async function generateContentWithContext(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: { role: 'user' | 'model'; content: string }[] = []
): Promise<string> {
  const model = initializeGemini();
  
  try {
    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });
    
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate content from AI');
  }
}

export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const model = initializeGemini();
  
  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Vision API error:', error);
    throw new Error('Failed to analyze image');
  }
}
