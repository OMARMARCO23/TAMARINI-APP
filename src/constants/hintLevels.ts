import { HintLevel } from '@/types';

export const HINT_LEVEL_DESCRIPTIONS: Record<HintLevel, {
  name: string;
  description: string;
  icon: string;
}> = {
  1: {
    name: 'Gentle Nudge',
    description: 'A very general hint to point you in the right direction',
    icon: '💡',
  },
  2: {
    name: 'Key Concept',
    description: 'Identifies the main concept or theorem needed',
    icon: '🔑',
  },
  3: {
    name: 'Structured Approach',
    description: 'Shows you the step-by-step approach without solving',
    icon: '📋',
  },
  4: {
    name: 'Partial Solution',
    description: 'Works through part of the problem with you',
    icon: '✏️',
  },
  5: {
    name: 'Similar Example',
    description: 'Shows a fully solved similar problem',
    icon: '📖',
  },
};

export const HINT_PROMPTS: Record<HintLevel, string> = {
  1: 'Provide a very general conceptual hint. Ask what the question is really asking. Do not mention any formulas or specific methods.',
  2: 'Point to the key concept, theorem, or formula category needed. For example: "This is about the Pythagorean theorem" but do not show the formula yet.',
  3: 'Provide a structured approach with numbered steps the student should follow. Do not fill in any calculations.',
  4: 'Work through the first 1-2 steps showing the setup, then ask the student to continue.',
  5: 'Provide a fully worked similar (but different) problem that demonstrates the same concepts.',
};

export const ENCOURAGEMENT_MESSAGES = {
  correct: [
    "Excellent work! You've got it! 🎉",
    "That's right! Great thinking! ⭐",
    "Perfect! You're really understanding this! 🌟",
    "Spot on! Keep up the great work! 💪",
    "Exactly right! You're making great progress! 🚀",
  ],
  incorrect: [
    "Not quite, but you're thinking! Let's look at this together. 🤔",
    "Good attempt! Let me guide you a bit more. 💭",
    "Almost there! Let's take another approach. 🔄",
    "That's a common mistake. Here's a hint... 💡",
    "Keep trying! Learning happens through attempts. 📚",
  ],
  needsHint: [
    "Would you like a small hint? 💡",
    "Need some guidance? I'm here to help! 🤝",
    "Stuck? Let me give you a nudge in the right direction. 👆",
  ],
};
