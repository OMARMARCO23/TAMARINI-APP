'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Flame,
  Target,
  Award,
  BookOpen,
  Lightbulb,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useProgress } from '@/hooks/useProgress';
import { MATH_TOPICS, TOPIC_COLORS } from '@/constants/topics';
import { cn } from '@/lib/utils';

export default function ProgressPage() {
  const { progress, overallStats, topicBreakdown, recentActivity, hintsImprovement } = useProgress();

  const statCards = [
    {
      title: 'Problems Solved',
      value: progress.totalProblemsCompleted,
      subtitle: `of ${progress.totalProblemsAttempted} attempted`,
      icon: <Target className="w-6 h-6" />,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/10',
    },
    {
      title: 'Day Streak',
      value: progress.streakDays,
      subtitle: 'consecutive days',
      icon: <Flame className="w-6 h-6" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Avg. Hints/Problem',
      value: progress.averageHintsPerProblem.toFixed(1),
      subtitle: hintsImprovement !== null 
        ? `${hintsImprovement > 0 ? '↓' : '↑'} ${Math.abs(hintsImprovement)}% vs before`
        : 'Keep practicing!',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Completion Rate',
      value: `${overallStats.completionRate.toFixed(0)}%`,
      subtitle: 'of problems completed',
      icon: <Award className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-tutor-bg">
      {/* Header */}
      <header className="bg-tutor-card border-b border-tutor-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-tutor-muted hover:text-tutor-text transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-tutor-text">My Progress</h1>
                <p className="text-sm text-tutor-muted">Track your learning journey</p>
              </div>
            </div>
            <Link href="/tutor">
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="bordered">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-tutor-muted mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-tutor-text">{stat.value}</p>
                      <p className="text-xs text-tutor-muted mt-1">{stat.subtitle}</p>
                    </div>
                    <div className={cn('p-3 rounded-xl', stat.bgColor, stat.color)}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topics Breakdown */}
          <div className="lg:col-span-2">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Topic Progress</CardTitle>
                <CardDescription>Your performance across different math topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topicBreakdown.map((topic, index) => (
                    <motion.div
                      key={topic.topic}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4"
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          TOPIC_COLORS[topic.topic]
                        )}
                      >
                        <span className="text-lg">{topic.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-tutor-text">{topic.name}</span>
                          <span className="text-sm text-tutor-muted">
                            {topic.completed}/{topic.attempted} completed
                          </span>
                        </div>
                        <div className="h-2 bg-tutor-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${topic.completionRate}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn('h-full rounded-full', TOPIC_COLORS[topic.topic])}
                          />
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          topic.completionRate >= 70
                            ? 'text-green-400'
                            : topic.completionRate >= 40
                            ? 'text-yellow-400'
                            : 'text-tutor-muted'
                        )}
                      >
                        {topic.completionRate}%
                      </span>
                    </motion.div>
                  ))}

                  {topicBreakdown.every((t) => t.attempted === 0) && (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-tutor-muted mx-auto mb-3" />
                      <p className="text-tutor-muted">No problems attempted yet.</p>
                      <Link href="/tutor" className="text-primary-400 hover:underline text-sm">
                        Start your first problem →
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Strongest/Weakest */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="text-base">Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {overallStats.strongestTopic && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm text-tutor-muted">Strongest Topic</p>
                      <p className="font-medium text-tutor-text">
                        {MATH_TOPICS[overallStats.strongestTopic].icon}{' '}
                        {MATH_TOPICS[overallStats.strongestTopic].name}
                      </p>
                    </div>
                  </div>
                )}

                {overallStats.weakestTopic && (
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-sm text-tutor-muted">Needs Practice</p>
                      <p className="font-medium text-tutor-text">
                        {MATH_TOPICS[overallStats.weakestTopic].icon}{' '}
                        {MATH_TOPICS[overallStats.weakestTopic].name}
                      </p>
                    </div>
                  </div>
                )}

                {!overallStats.strongestTopic && !overallStats.weakestTopic && (
                  <p className="text-tutor-muted text-sm text-center py-4">
                    Complete more problems to see insights!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.topic}
                        className="flex items-center justify-between py-2 border-b border-tutor-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span>{activity.icon}</span>
                          <span className="text-sm text-tutor-text">{activity.name}</span>
                        </div>
                        <span className="text-xs text-tutor-muted">
                          {activity.lastPracticed
                            ? new Date(activity.lastPracticed).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-tutor-muted text-sm text-center py-4">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Hints Improvement */}
            {hintsImprovement !== null && (
              <Card variant="bordered">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    {hintsImprovement > 0 ? (
                      <div className="p-3 bg-green-500/10 rounded-xl">
                        <TrendingDown className="w-6 h-6 text-green-400" />
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-500/10 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-yellow-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-tutor-muted">Hint Usage Trend</p>
                      <p className="font-medium text-tutor-text">
                        {hintsImprovement > 0
                          ? `${hintsImprovement}% fewer hints needed!`
                          : 'Keep practicing to reduce hints'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Empty State */}
        {progress.totalProblemsAttempted === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-tutor-card rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Award className="w-12 h-12 text-tutor-muted" />
            </div>
            <h2 className="text-2xl font-bold text-tutor-text mb-3">Start Your Journey!</h2>
            <p className="text-tutor-muted mb-6 max-w-md mx-auto">
              You haven't solved any problems yet. Start practicing to track your progress
              and see your improvement over time.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/tutor">
                <Button size="lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Start First Problem
                </Button>
              </Link>
              <Link href="/practice">
                <Button size="lg" variant="secondary">
                  Browse Practice Problems
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
