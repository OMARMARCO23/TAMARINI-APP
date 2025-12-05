const API_URL = 'https://tamarini-app.vercel.app/api/chat';

export async function sendMessage(question, language = 'en', history = []) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        language,
        history,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle quota exceeded
      if (data.details?.includes('quota')) {
        throw new Error('QUOTA_EXCEEDED');
      }
      throw new Error(data.error || 'API request failed');
    }

    return data.reply;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
