import { useState, useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useProgressStore } from '@/store/progressStore';
import { Problem, Message, HintLevel, AnalysisResult, StepCheckResult } from '@/types';
import { generateId } from '@/lib/utils';

export function useTutorSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    currentSession,
    startNewSession,
    addMessage,
    updateHintLevel,
    completeStep,
    incrementHints,
    incrementAttempts,
    completeSession,
    abandonSession,
  } = useSessionStore();
  
  const { recordProblemAttempt, recordProblemCompletion } = useProgressStore();
  
  const analyzeProblem = useCallback(async (problemText: string): Promise<Problem | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problemText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze problem');
      }
      
      const analysis: AnalysisResult = await response.json();
      
      const problem: Problem = {
        id: generateId(),
        originalText: problemText,
        topic: analysis.topic,
        subTopic: analysis.subTopic,
        difficulty: analysis.difficulty,
        steps: analysis.steps.map((step, index) => ({
          id: generateId(),
          order: index + 1,
          description: step.description,
          hint: step.hint,
          question: step.question,
          expectedConcept: step.expectedConcept,
          isCompleted: false,
        })),
        createdAt: new Date(),
      };
      
      startNewSession(problem);
      recordProblemAttempt(problem.topic);
      
      // Add welcome message
      addMessage({
        role: 'assistant',
        content: `Great! I see you're working on a ${analysis.topic} problem about ${analysis.subTopic}. Let's break this down together!\n\nFirst, ${analysis.steps[0].question}`,
        type: 'text',
        metadata: { stepNumber: 1 },
      });
      
      return problem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [startNewSession, addMessage, recordProblemAttempt]);
  
  const requestHint = useCallback(async (level?: HintLevel): Promise<void> => {
    if (!currentSession?.problem) return;
    
    setIsLoading(true);
    const hintLevel = level || Math.min(currentSession.currentHintLevel + 1, 5) as HintLevel;
    
    try {
      const response = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: currentSession.problem.originalText,
          currentStep: currentSession.currentStep,
          hintLevel,
          previousHints: currentSession.messages
            .filter(m => m.type === 'hint')
            .map(m => m.content),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get hint');
      
      const { hint, question } = await response.json();
      
      updateHintLevel(hintLevel);
      incrementHints();
      
      addMessage({
        role: 'assistant',
        content: `${hint}\n\n${question || ''}`,
        type: 'hint',
        metadata: { hintLevel, stepNumber: currentSession.currentStep + 1 },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, updateHintLevel, incrementHints, addMessage]);
  
  const submitAnswer = useCallback(async (answer: string): Promise<StepCheckResult | null> => {
    if (!currentSession?.problem) return null;
    
    setIsLoading(true);
    incrementAttempts();
    
    try {
      // Add user message
      addMessage({
        role: 'user',
        content: answer,
        type: 'text',
      });
      
      const currentStepData = currentSession.problem.steps[currentSession.currentStep];
      
      const response = await fetch('/api/check-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: currentSession.problem.originalText,
          stepDescription: currentStepData.description,
          studentAnswer: answer,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to check answer');
      
      const result: StepCheckResult = await response.json();
      
      addMessage({
        role: 'assistant',
        content: `${result.feedback}\n\n${result.encouragement}${result.correctApproach ? '\n\n' + result.correctApproach : ''}`,
        type: 'feedback',
        metadata: { isCorrect: result.isCorrect },
      });
      
      if (result.isCorrect) {
        completeStep(currentSession.currentStep, true);
        
        // Check if problem is complete
        const isComplete = currentSession.currentStep >= currentSession.problem.steps.length - 1;
        
        if (isComplete) {
          recordProblemCompletion(currentSession.problem.topic, currentSession.hintsUsed);
          addMessage({
            role: 'assistant',
            content: "🎉 Excellent work! You've successfully solved this problem! Would you like to try a concept check quiz or work on a similar problem?",
            type: 'text',
          });
        } else {
          // Move to next step
          const nextStep = currentSession.problem.steps[currentSession.currentStep + 1];
          addMessage({
            role: 'assistant',
            content: `Great! Now for the next step: ${nextStep.question}`,
            type: 'question',
            metadata: { stepNumber: currentSession.currentStep + 2 },
          });
        }
      }
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, addMessage, incrementAttempts, completeStep, recordProblemCompletion]);
  
  const finishSession = useCallback(() => {
    if (currentSession?.problem) {
      recordProblemCompletion(currentSession.problem.topic, currentSession.hintsUsed);
    }
    completeSession();
  }, [currentSession, completeSession, recordProblemCompletion]);
  
  return {
    currentSession,
    isLoading,
    error,
    analyzeProblem,
    requestHint,
    submitAnswer,
    finishSession,
    abandonSession,
  };
}
