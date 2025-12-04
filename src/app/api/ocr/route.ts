import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    
    const prompt = `Extract the mathematical problem or equation from this image. 
    Return ONLY the mathematical content, formatted clearly. 
    If there are multiple problems, extract all of them numbered.
    Use standard mathematical notation.`;
    
    const result = await analyzeImage(base64, file.type, prompt);
    
    return NextResponse.json({ text: result });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
