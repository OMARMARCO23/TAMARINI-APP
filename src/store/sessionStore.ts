import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TutorSession, Message, Problem, HintLevel } from '@/types';
import { generateId } from '@/lib/utils';

interface SessionState {
  currentSession: TutorSession | null;
  sessions: TutorSession[];
  
  // Actions
  startNewSession: (problem: Problem) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateHintLevel: (level: HintLevel) => void;
  completeStep: (stepIndex: number, isCorrect: boolean) => void;
  incrementHints: () => void;
  incrementAttempts: () => void;
  completeSession: () => void;
  abandonSession: () => void;
  clearCurrentSession: () => void;
  getSessionById: (id: string) => TutorSession | undefined;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      
      startNewSession: (problem: Problem) => {
        const newSession: TutorSession = {
          id: generateId(),
          problem,
          messages: [],
          currentStep: 0,
          currentHintLevel: 1,
          hintsUsed: 0,
          attemptsMade: 0,
          startedAt: new Date(),
          status: 'active',
        };
        
        set((state) => ({
          currentSession: newSession,
          sessions: [...state.sessions, newSession],
        }));
      },
      
      addMessage: (message) => {
        const fullMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: new Date(),
        };
        
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                messages: [...state.currentSession.messages, fullMessage],
              }
            : null,
        }));
      },
      
      updateHintLevel: (level: HintLevel) => {
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, currentHintLevel: level }
            : null,
        }));
      },
      
      completeStep: (stepIndex: number, isCorrect: boolean) => {
        set((state) => {
          if (!state.currentSession?.problem) return state;
          
          const updatedSteps = [...state.currentSession.problem.steps];
          if (updatedSteps[stepIndex]) {
            updatedSteps[stepIndex] = {
              ...updatedSteps[stepIndex],
              isCompleted: true,
              isCorrect,
            };
          }
          
          const nextStep = stepIndex + 1;
          const isLastStep = nextStep >= updatedSteps.length;
          
          return {
            currentSession: {
              ...state.currentSession,
              problem: {
                ...state.currentSession.problem,
                steps: updatedSteps,
              },
              currentStep: isLastStep ? stepIndex : nextStep,
              currentHintLevel: 1, // Reset hint level for new step
            },
          };
        });
      },
      
      incrementHints: () => {
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                hintsUsed: state.currentSession.hintsUsed + 1,
              }
            : null,
        }));
      },
      
      incrementAttempts: () => {
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                attemptsMade: state.currentSession.attemptsMade + 1,
              }
            : null,
        }));
      },
      
      completeSession: () => {
        set((state) => {
          if (!state.currentSession) return state;
          
          const completedSession: TutorSession = {
            ...state.currentSession,
            status: 'completed',
            completedAt: new Date(),
          };
          
          return {
            currentSession: null,
            sessions: state.sessions.map((s) =>
              s.id === completedSession.id ? completedSession : s
            ),
          };
        });
      },
      
      abandonSession: () => {
        set((state) => {
          if (!state.currentSession) return state;
          
          const abandonedSession: TutorSession = {
            ...state.currentSession,
            status: 'abandoned',
            completedAt: new Date(),
          };
          
          return {
            currentSession: null,
            sessions: state.sessions.map((s) =>
              s.id === abandonedSession.id ? abandonedSession : s
            ),
          };
        });
      },
      
      clearCurrentSession: () => {
        set({ currentSession: null });
      },
      
      getSessionById: (id: string) => {
        return get().sessions.find((s) => s.id === id);
      },
    }),
    {
      name: 'tamarini-session-storage',
      partialize: (state) => ({
        sessions: state.sessions.slice(-50), // Keep last 50 sessions
      }),
    }
  )
);
