// Replace with your Vercel deployment URL
const API_URL = 'https://tamrini-api.vercel.app/api/chat';

export async function askTamrini(question, language = 'en', conversationHistory = []) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        language,
        history: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.reply;

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
