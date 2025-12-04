import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return uuidv4();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function sanitizeMathInput(input: string): string {
  // Basic sanitization for math input
  return input
    .replace(/[<>]/g, '')
    .trim();
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatMathExpression(expression: string): string {
  // Convert common math notation to LaTeX
  return expression
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/\*/g, '\\times ')
    .replace(/\//g, '\\div ');
}

export function extractLatex(text: string): string[] {
  const latexPattern = /\$\$?([^$]+)\$\$?/g;
  const matches: string[] = [];
  let match;
  while ((match = latexPattern.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = today;
  
  for (const date of sortedDates) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor(
      (currentDate.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = dateOnly;
    } else {
      break;
    }
  }
  
  return streak;
}
