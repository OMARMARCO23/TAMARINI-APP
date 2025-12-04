import { createWorker, Worker } from 'tesseract.js';

let worker: Worker | null = null;

export async function initializeOCR(): Promise<Worker> {
  if (!worker) {
    worker = await createWorker('eng', 1, {
      logger: (m) => console.log(m),
    });
    
    // Add math-specific configurations
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789+-*/=()[]{}xyzXYZabcdefghijklmnopqrstuvwABCDEFGHIJKLMNOPQRSTUVW^√πθαβγΣ∫∞≤≥≠.,<> ',
    });
  }
  return worker;
}

export async function extractTextFromImage(imageSource: string | File): Promise<string> {
  const worker = await initializeOCR();
  
  let imageData: string;
  
  if (typeof imageSource === 'string') {
    imageData = imageSource;
  } else {
    imageData = await fileToBase64(imageSource);
  }
  
  const { data: { text } } = await worker.recognize(imageData);
  
  // Clean up the extracted text
  return cleanMathText(text);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function cleanMathText(text: string): string {
  return text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[|]/g, '1') // Common OCR mistake
    .replace(/O(?=\d)/g, '0') // O before numbers is likely 0
    .replace(/l(?=\d)/g, '1') // l before numbers is likely 1
    .trim();
}

export async function terminateOCR(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
