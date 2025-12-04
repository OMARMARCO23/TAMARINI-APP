'use client';

import { useMemo } from 'react';
import { useProgressStore } from '@/store/progressStore';
import { MathTopic } from '@/types';
import { MATH_TOPICS } from '@/constants/topics';

export function useProgress() {
  const { progress, getTopicProgress, getOverallStats } = useProgressStore();

  const overallStats = useMemo(() => getOverallStats(), [getOverallStats]);

  const topicBreakdown = useMemo(() => {
    return (Object.keys(MATH_TOPICS) as MathTopic[]).map((topic) => {
      const stats = getTopicProgress(topic);
      return {
        topic,
        name: MATH_TOPICS[topic].name,
        icon: MATH_TOPICS[topic].icon,
        ...stats,
        completionRate: stats.attempted > 0
          ? Math.round((stats.completed / stats.attempted) * 100)
          : 0,
      };
    }).sort((a, b) => b.completed - a.completed);
  }, [getTopicProgress]);

  const recentActivity = useMemo(() => {
    return topicBreakdown
      .filter((t) => t.lastPracticed)
      .sort((a, b) => {
        const dateA = a.lastPracticed ? new Date(a.lastPracticed).getTime() : 0;
        const dateB = b.lastPracticed ? new Date(b.lastPracticed).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [topicBreakdown]);

  const hintsImprovement = useMemo(() => {
    const history = progress.hintsUsedHistory;
    if (history.length < 10) return null;

    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (firstAvg === 0) return null;
    const improvement = ((firstAvg - secondAvg) / firstAvg) * 100;
    return Math.round(improvement);
  }, [progress.hintsUsedHistory]);

  return {
    progress,
    overallStats,
    topicBreakdown,
    recentActivity,
    hintsImprovement,
  };
}
