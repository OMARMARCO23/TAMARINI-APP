// pages/api/tutor.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export default async function handler(req, res) {
  const { history, imageBase64, userMessage } = req.body;

  // Select model (Gemini 1.5 Pro is best for math reasoning)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const chat = model.startChat({
    history: history, // Maintain conversation context
    systemInstruction: "You are Tamarini, a Socratic Math Tutor... [Insert full prompt from above]"
  });

  let result;
  if (imageBase64) {
    // If user uploads a photo, we send image + text
    const imagePart = {
      inlineData: { data: imageBase64, mimeType: "image/jpeg" },
    };
    result = await chat.sendMessage([userMessage, imagePart]);
  } else {
    // Text only interaction
    result = await chat.sendMessage(userMessage);
  }

  const response = result.response.text();
  res.status(200).json({ reply: response });
}
