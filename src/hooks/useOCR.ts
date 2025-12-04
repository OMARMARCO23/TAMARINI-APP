import { useState, useCallback } from 'react';

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const processImage = useCallback(async (file: File): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create FormData to send the image
      const formData = new FormData();
      formData.append('image', file);

      // Send to our API route that uses Gemini Vision
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      const extractedText = data.text;

      setResult(extractedText);
      return extractedText;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process image';
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processImageWithTesseract = useCallback(async (file: File): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Dynamic import of Tesseract.js to avoid SSR issues
      const Tesseract = await import('tesseract.js');
      
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      // Clean up the extracted text
      const cleanedText = text
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      setResult(cleanedText);
      return cleanedText;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process image';
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    processImage,
    processImageWithTesseract,
    isProcessing,
    error,
    result,
    clearResult,
  };
}
