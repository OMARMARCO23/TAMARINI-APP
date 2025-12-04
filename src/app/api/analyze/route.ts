import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { createAnalysisPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { problem } = await request.json();
    
    if (!problem || typeof problem !== 'string') {
      return NextResponse.json(
        { error: 'Problem text is required' },
        { status: 400 }
      );
    }
    
    const prompt = createAnalysisPrompt(problem);
    const response = await generateContent(prompt);
    
    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (!analysis.topic || !analysis.steps || !Array.isArray(analysis.steps)) {
      throw new Error('Invalid analysis structure');
    }
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze problem' },
      { status: 500 }
    );
  }
}
