// Simple math expression validator and formatter

export function isValidMathExpression(expression: string): boolean {
  // Basic validation - checks for balanced parentheses and valid characters
  const validChars = /^[0-9+\-*/^().\s=xyzabcπesincostavlgqrt\[\]{}]+$/i;
  
  if (!validChars.test(expression)) {
    return false;
  }
  
  // Check balanced parentheses
  let count = 0;
  for (const char of expression) {
    if (char === '(' || char === '[' || char === '{') count++;
    if (char === ')' || char === ']' || char === '}') count--;
    if (count < 0) return false;
  }
  
  return count === 0;
}

export function formatToLatex(expression: string): string {
  let result = expression;
  
  // Common conversions
  const conversions: [RegExp, string][] = [
    [/sqrt\(([^)]+)\)/gi, '\\sqrt{$1}'],
    [/\^(\d+)/g, '^{$1}'],
    [/\^([a-z])/gi, '^{$1}'],
    [/\*/g, ' \\times '],
    [/\//g, ' \\div '],
    [/pi/gi, '\\pi'],
    [/theta/gi, '\\theta'],
    [/alpha/gi, '\\alpha'],
    [/beta/gi, '\\beta'],
    [/infinity/gi, '\\infty'],
    [/>=/, '\\geq'],
    [/<=/, '\\leq'],
    [/!=/g, '\\neq'],
    [/sin/g, '\\sin'],
    [/cos/g, '\\cos'],
    [/tan/g, '\\tan'],
    [/log/g, '\\log'],
    [/ln/g, '\\ln'],
  ];
  
  for (const [pattern, replacement] of conversions) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
}

export function extractNumbers(expression: string): number[] {
  const numberPattern = /-?\d+\.?\d*/g;
  const matches = expression.match(numberPattern);
  return matches ? matches.map(Number) : [];
}

export function identifyMathType(expression: string): string {
  const patterns: [RegExp, string][] = [
    [/\d+\s*[+\-*/]\s*\d+\s*=/, 'equation'],
    [/x\s*[+\-]\s*\d+\s*=\s*\d+/, 'linear-equation'],
    [/x\^2|x²/, 'quadratic'],
    [/\d+\/\d+/, 'fraction'],
    [/%/, 'percentage'],
    [/sin|cos|tan/, 'trigonometry'],
    [/∫|integral|derivative|d\/dx/, 'calculus'],
    [/\[.*\].*\[.*\]/, 'matrix'],
    [/√|sqrt/, 'radical'],
  ];
  
  for (const [pattern, type] of patterns) {
    if (pattern.test(expression)) {
      return type;
    }
  }
  
  return 'general';
}

export function simplifyFraction(numerator: number, denominator: number): [number, number] {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return [numerator / divisor, denominator / divisor];
}
