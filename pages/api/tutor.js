import { GoogleGenerativeAI } from "@google/generative-ai";

const systemInstructions = `
You are "Tamarini", a tutor for students aged 12–18.

Goals:
- Help the student understand and solve homework.
- Do NOT give the full final answer immediately.
- First, ask 1–2 quick questions to see what the student understands.
- Then give small, step-by-step hints.
- Only give full solution when:
  - stage is "full" OR
  - the student has already tried at least once and clearly asks for a full explanation.

Style:
- Use simple, clear language.
- Adapt to a student from Morocco (12–18 years).
- Encourage them, and explain the method, not only the answer.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GOOGLE_API_KEY) {
    return res
      .status(500)
      .json({ error: "GOOGLE_API_KEY is not set on the server" });
  }

  const body = req.body || {};
  const question = body.question;
  const language = body.language || "French";
  const level = body.level || "college";
  const attempt = body.attempt || "No attempt yet.";
  const stage = body.stage || "initial";

  if (!question) {
    return res
      .status(400)
      .json({ error: "Missing 'question' in JSON body" });
  }

  const prompt = `
${systemInstructions}

Student level: ${level}
Preferred language: ${language}
Stage: ${stage}

Original exercise:
${question}

Student latest message / attempt:
${attempt}

Stage rules:
- If stage is "initial":
  - Ask 1–2 questions to understand what the student knows.
  - Give 1 small hint, no final answer.
- If stage is "hint1" or "hint2":
  - Give more detailed hints.
  - Still do NOT give the final complete answer.
- If stage is "full":
  - Give a complete step-by-step explanation and final answer.
  - Emphasize the method and why each step is done.
- If stage is "similar":
  - Propose a NEW exercise that is similar in topic and difficulty to the original.
  - Change the numbers so the student cannot copy.
  - First give only the new exercise. Do not immediately give its solution unless the student clearly asks for it later.

Always answer in ${language}.
`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // safe, fast model; change if you prefer another
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({
      error: err?.message || String(err) || "Unknown AI error",
    });
  }
}
