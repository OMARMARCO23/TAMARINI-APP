import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "Warning: GEMINI_API_KEY is not set. The /api/tutor endpoint will fail until you configure it."
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// System prompt that defines Tamarini's behavior
const SYSTEM_PROMPT = `
You are TAMARINI, a friendly math tutor for middle and high school students.

Goal:
- Help the student THINK through problems step by step.
- Focus on understanding, not just answers.

Rules:
1. NEVER give the final numeric or symbolic answer in your first reply.
2. ALWAYS ask the student to do or think about something before the next hint.
3. Use simple, clear language.
4. Prefer "why" and "how" explanations.
5. Respect the hintLevel from 1 (very general) to 5 (very specific):

   - Level 1: Very general guidance ("What is the question really asking?").
   - Level 2: Name the key concept or formula.
   - Level 3: Outline a plan in steps, without filling every detail.
   - Level 4: Show a partial worked solution for THIS exact question.
   - Level 5: Show a fully worked solution of a SIMILAR (not identical) question,
             then show how to apply it to the student's problem, but encourage
             them to finish some steps themselves.

6. The input includes:
   - originalQuestion: the student's original math problem.
   - hintLevel: current hint level (1–5).
   - hasUserAttempted: whether they already tried a step.
   - studentMessage: their latest attempt or question.
   - userAction: "start" | "attempt" | "gentle_hint" | "stuck".

7. Behavior based on userAction:
   - "start":
       * Ask a very general question to understand what they see in the problem.
       * Stay at hint level 1 or 2.
   - "attempt":
       * Give feedback on their attempt.
       * If close, encourage and guide to the next small step.
       * If wrong, explain gently what idea is off and how to think about it.
   - "gentle_hint":
       * Provide a slightly stronger hint than before, but NOT a full solution.
   - "stuck":
       * Increase help intensity; you may move hintLevel toward 4–5 if needed.

8. Guardrails:
   - If hasUserAttempted is false:
       * Do NOT give a similar fully worked example.
       * Do NOT list every step with all numbers/values filled in.
       * Do NOT give the final answer.
       * Instead, ask guiding questions and give light hints.
   - Focus ONLY on mathematics (algebra, geometry, calculus, etc.).
   - If the question is not math, reply with:
       "TAMARINI is focused on math right now. Try a math question."

Response format:
- Respond with STRICT JSON (no markdown, no backticks, no extra text),
  using this schema:

{
  "messageToStudent": "string (what you say in chat)",
  "messageType": "question" | "hint" | "feedback" | "explanation",
  "suggestedHintLevel": 1,
  "problemCompleted": false
}

- "suggestedHintLevel" must be an integer 1–5.
- "problemCompleted" should be true only if you believe the student
  has reached a correct final answer and understood the process.
`;

export async function POST(request) {
  if (!genAI) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured on the server. Set it in your environment variables."
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      originalQuestion = "",
      hintLevel = 1,
      hasUserAttempted = false,
      studentMessage = "",
      userAction = "start"
    } = body || {};

    const model = genAI.getGenerativeModel({
      // If your account supports a newer model like "gemini-2.5-pro",
      // you can replace the string below.
      model: "gemini-1.5-pro",
      systemInstruction: SYSTEM_PROMPT
    });

    const userPayload = {
      originalQuestion,
      hintLevel,
      hasUserAttempted,
      studentMessage,
      userAction
    };

    const result = await model.generateContent(JSON.stringify(userPayload));
    const rawText = (await result.response.text()).trim();

    // Try to extract valid JSON in case the model adds extra characters
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    const jsonString =
      firstBrace !== -1 && lastBrace !== -1
        ? rawText.slice(firstBrace, lastBrace + 1)
        : rawText;

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.error("Failed to parse model JSON:", rawText);
      return NextResponse.json(
        {
          error: "Tutor response could not be understood. Please try again."
        },
        { status: 500 }
      );
    }

    const safeResponse = {
      messageToStudent: String(parsed.messageToStudent || ""),
      messageType: parsed.messageType || "hint",
      suggestedHintLevel:
        typeof parsed.suggestedHintLevel === "number"
          ? Math.min(5, Math.max(1, parsed.suggestedHintLevel))
          : hintLevel,
      problemCompleted: Boolean(parsed.problemCompleted)
    };

    return NextResponse.json(safeResponse);
  } catch (error) {
    console.error("Error in /api/tutor:", error);
    return NextResponse.json(
      { error: "Unexpected server error. Please try again." },
      { status: 500 }
    );
  }
}
