'use client';

import { useState, useCallback } from 'react';

interface UseOCRReturn {
  processImage: (file: File) => Promise<string | null>;
  isProcessing: boolean;
  error: string | null;
  result: string | null;
  clearResult: () => void;
}

export function useOCR(): UseOCRReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const processImage = useCallback(async (file: File): Promise<string | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      const extractedText = data.text || '';

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

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    processImage,
    isProcessing,
    error,
    result,
    clearResult,
  };
}
