import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { createHintPrompt, createSimilarExamplePrompt } from '@/lib/prompts';
import { HintLevel } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { problem, currentStep, hintLevel, previousHints, studentAttempt } = await request.json();
    
    if (!problem || typeof currentStep !== 'number' || !hintLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // For level 5, get a similar example instead of a hint
    if (hintLevel === 5) {
      const examplePrompt = createSimilarExamplePrompt(problem, 'algebra'); // Topic would come from session
      const response = await generateContent(examplePrompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }
      
      const example = JSON.parse(jsonMatch[0]);
      
      return NextResponse.json({
        hint: `Here's a similar problem with solution:\n\n**Problem:** ${example.problem}\n\n**Solution:**\n${example.steps.join('\n')}\n\n**Final Answer:** ${example.solution}`,
        question: 'Now, can you apply the same approach to your original problem?',
        isLastHint: true,
      });
    }
    
    const prompt = createHintPrompt(
      problem,
      currentStep,
      hintLevel as HintLevel,
      previousHints || [],
      studentAttempt
    );
    
    const response = await generateContent(prompt);
    
    // Extract hint and any follow-up question
    const lines = response.split('\n').filter(l => l.trim());
    const hint = lines.slice(0, -1).join('\n') || response;
    const question = lines[lines.length - 1]?.includes('?') ? lines[lines.length - 1] : undefined;
    
    return NextResponse.json({
      hint,
      question,
      isLastHint: hintLevel === 5,
    });
  } catch (error) {
    console.error('Hint error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hint' },
      { status: 500 }
    );
  }
}
