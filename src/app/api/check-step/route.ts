import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { createStepCheckPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { problem, stepDescription, studentAnswer } = await request.json();
    
    if (!problem || !stepDescription || !studentAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const prompt = createStepCheckPrompt(problem, stepDescription, studentAnswer);
    const response = await generateContent(prompt);
    
    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback if JSON parsing fails
      return NextResponse.json({
        isCorrect: false,
        feedback: 'I had trouble understanding your answer. Could you try rephrasing it?',
        encouragement: "Keep trying! Every attempt helps you learn.",
      });
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Step check error:', error);
    return NextResponse.json(
      { error: 'Failed to check step' },
      { status: 500 }
    );
  }
}
