import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudentProgress, MathTopic, TopicStats } from '@/types';
import { generateId, calculateStreak } from '@/lib/utils';

const defaultTopicStats: TopicStats = {
  attempted: 0,
  completed: 0,
  averageHints: 0,
  strongAreas: [],
  weakAreas: [],
};

const defaultProgress: StudentProgress = {
  id: generateId(),
  totalProblemsAttempted: 0,
  totalProblemsCompleted: 0,
  topicStats: {
    algebra: { ...defaultTopicStats },
    geometry: { ...defaultTopicStats },
    trigonometry: { ...defaultTopicStats },
    calculus: { ...defaultTopicStats },
    statistics: { ...defaultTopicStats },
    'number-theory': { ...defaultTopicStats },
    'linear-algebra': { ...defaultTopicStats },
    arithmetic: { ...defaultTopicStats },
  },
  streakDays: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  hintsUsedHistory: [],
  averageHintsPerProblem: 0,
};

interface ProgressState {
  progress: StudentProgress;
  activeDates: string[];
  
  // Actions
  recordProblemAttempt: (topic: MathTopic) => void;
  recordProblemCompletion: (topic: MathTopic, hintsUsed: number) => void;
  updateTopicStrength: (topic: MathTopic, subTopic: string, isStrong: boolean) => void;
  resetProgress: () => void;
  getTopicProgress: (topic: MathTopic) => TopicStats;
  getOverallStats: () => {
    completionRate: number;
    averageHints: number;
    strongestTopic: MathTopic | null;
    weakestTopic: MathTopic | null;
  };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: defaultProgress,
      activeDates: [],
      
      recordProblemAttempt: (topic: MathTopic) => {
        const today = new Date().toISOString().split('T')[0];
        
        set((state) => {
          const newActiveDates = state.activeDates.includes(today)
            ? state.activeDates
            : [...state.activeDates, today];
          
          return {
            progress: {
              ...state.progress,
              totalProblemsAttempted: state.progress.totalProblemsAttempted + 1,
              topicStats: {
                ...state.progress.topicStats,
                [topic]: {
                  ...state.progress.topicStats[topic],
                  attempted: state.progress.topicStats[topic].attempted + 1,
                },
              },
              lastActiveDate: today,
              streakDays: calculateStreak(newActiveDates),
            },
            activeDates: newActiveDates,
          };
        });
      },
      
      recordProblemCompletion: (topic: MathTopic, hintsUsed: number) => {
        set((state) => {
          const topicStats = state.progress.topicStats[topic];
          const newCompleted = topicStats.completed + 1;
          const newTotalHints = topicStats.averageHints * topicStats.completed + hintsUsed;
          const newAverageHints = newTotalHints / newCompleted;
          
          const newHintsHistory = [...state.progress.hintsUsedHistory, hintsUsed].slice(-100);
          const newOverallAverage = 
            newHintsHistory.reduce((a, b) => a + b, 0) / newHintsHistory.length;
          
          return {
            progress: {
              ...state.progress,
              totalProblemsCompleted: state.progress.totalProblemsCompleted + 1,
              topicStats: {
                ...state.progress.topicStats,
                [topic]: {
                  ...topicStats,
                  completed: newCompleted,
                  averageHints: newAverageHints,
                  lastPracticed: new Date(),
                },
              },
              hintsUsedHistory: newHintsHistory,
              averageHintsPerProblem: newOverallAverage,
            },
          };
        });
      },
      
      updateTopicStrength: (topic: MathTopic, subTopic: string, isStrong: boolean) => {
        set((state) => {
          const topicStats = state.progress.topicStats[topic];
          let strongAreas = [...topicStats.strongAreas];
          let weakAreas = [...topicStats.weakAreas];
          
          if (isStrong) {
            if (!strongAreas.includes(subTopic)) strongAreas.push(subTopic);
            weakAreas = weakAreas.filter((a) => a !== subTopic);
          } else {
            if (!weakAreas.includes(subTopic)) weakAreas.push(subTopic);
            strongAreas = strongAreas.filter((a) => a !== subTopic);
          }
          
          return {
            progress: {
              ...state.progress,
              topicStats: {
                ...state.progress.topicStats,
                [topic]: {
                  ...topicStats,
                  strongAreas,
                  weakAreas,
                },
              },
            },
          };
        });
      },
      
      resetProgress: () => {
        set({
          progress: { ...defaultProgress, id: generateId() },
          activeDates: [],
        });
      },
      
      getTopicProgress: (topic: MathTopic) => {
        return get().progress.topicStats[topic];
      },
      
      getOverallStats: () => {
        const { progress } = get();
        const completionRate = progress.totalProblemsAttempted > 0
          ? (progress.totalProblemsCompleted / progress.totalProblemsAttempted) * 100
          : 0;
        
        let strongestTopic: MathTopic | null = null;
        let weakestTopic: MathTopic | null = null;
        let highestCompletion = -1;
        let lowestCompletion = Infinity;
        
        (Object.entries(progress.topicStats) as [MathTopic, TopicStats][]).forEach(
          ([topic, stats]) => {
            if (stats.attempted > 0) {
              const rate = stats.completed / stats.attempted;
              if (rate > highestCompletion) {
                highestCompletion = rate;
                strongestTopic = topic;
              }
              if (rate < lowestCompletion && stats.attempted >= 3) {
                lowestCompletion = rate;
                weakestTopic = topic;
              }
            }
          }
        );
        
        return {
          completionRate,
          averageHints: progress.averageHintsPerProblem,
          strongestTopic,
          weakestTopic,
        };
      },
    }),
    {
      name: 'tamarini-progress-storage',
    }
  )
);
