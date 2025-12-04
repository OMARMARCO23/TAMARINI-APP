import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
