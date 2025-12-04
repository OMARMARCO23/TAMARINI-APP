'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Play,
  Star,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MATH_TOPICS, TOPIC_COLORS } from '@/constants/topics';
import { MathTopic } from '@/types';
import { cn } from '@/lib/utils';

// Sample practice problems for each topic
const PRACTICE_PROBLEMS: Record<MathTopic, { question: string; difficulty: string }[]> = {
  algebra: [
    { question: 'Solve for x: 2x + 5 = 13', difficulty: 'easy' },
    { question: 'Factor: x² - 5x + 6', difficulty: 'medium' },
    { question: 'Solve the system: 2x + y = 7, x - y = 2', difficulty: 'hard' },
  ],
  geometry: [
    { question: 'Find the area of a triangle with base 8 and height 5', difficulty: 'easy' },
    { question: 'Find the circumference of a circle with radius 7', difficulty: 'medium' },
    { question: 'Find the volume of a cone with radius 3 and height 4', difficulty: 'hard' },
  ],
  trigonometry: [
    { question: 'Find sin(30°)', difficulty: 'easy' },
    { question: 'Solve: sin(x) = 0.5 for 0 ≤ x ≤ 2π', difficulty: 'medium' },
    { question: 'Prove: sin²(x) + cos²(x) = 1', difficulty: 'hard' },
  ],
  calculus: [
    { question: 'Find the derivative of f(x) = x³', difficulty: 'easy' },
    { question: 'Evaluate: ∫(2x + 1)dx', difficulty: 'medium' },
    { question: 'Find the limit: lim(x→0) sin(x)/x', difficulty: 'hard' },
  ],
  statistics: [
    { question: 'Find the mean of: 4, 8, 6, 5, 7', difficulty: 'easy' },
    { question: 'Find the standard deviation of: 2, 4, 4, 4, 5, 5, 7, 9', difficulty: 'medium' },
    { question: 'If P(A) = 0.3 and P(B) = 0.4, find P(A or B) if independent', difficulty: 'hard' },
  ],
  'number-theory': [
    { question: 'Find the GCD of 24 and 36', difficulty: 'easy' },
    { question: 'Is 97 a prime number?', difficulty: 'medium' },
    { question: 'Find 17 mod 5', difficulty: 'easy' },
  ],
  'linear-algebra': [
    { question: 'Add matrices: [1,2] + [3,4]', difficulty: 'easy' },
    { question: 'Find the determinant of [[1,2],[3,4]]', difficulty: 'medium' },
    { question: 'Find the eigenvalues of [[2,1],[1,2]]', difficulty: 'hard' },
  ],
  arithmetic: [
    { question: 'Calculate: 15% of 80', difficulty: 'easy' },
    { question: 'Simplify: 3/4 + 2/3', difficulty: 'medium' },
    { question: 'If a price increases by 20%, then decreases by 20%, what is the net change?', difficulty: 'hard' },
  ],
};

export default function PracticePage() {
  const [selectedTopic, setSelectedTopic] = useState<MathTopic | null>(null);

  const topics = Object.entries(MATH_TOPICS) as [MathTopic, typeof MATH_TOPICS[MathTopic]][];

  return (
    <div className="min-h-screen bg-tutor-bg">
      {/* Header */}
      <header className="bg-tutor-card border-b border-tutor-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-tutor-muted hover:text-tutor-text transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-tutor-text">Practice Problems</h1>
              <p className="text-sm text-tutor-muted">Choose a topic and start practicing</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!selectedTopic ? (
          <>
            {/* Topic Selection Grid */}
            <h2 className="text-lg font-semibold text-tutor-text mb-6">Select a Topic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topics.map(([key, topic], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    variant="bordered"
                    className="cursor-pointer hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10"
                    onClick={() => setSelectedTopic(key)}
                  >
                    <CardContent className="p-6">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4',
                          TOPIC_COLORS[key]
                        )}
                      >
                        {topic.icon}
                      </div>
                      <h3 className="font-semibold text-tutor-text mb-1">{topic.name}</h3>
                      <p className="text-sm text-tutor-muted mb-3">{topic.description}</p>
                      <div className="flex items-center gap-2 text-xs text-tutor-muted">
                        <BookOpen className="w-3 h-3" />
                        <span>{PRACTICE_PROBLEMS[key].length} problems</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Problems List */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setSelectedTopic(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Topics
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{MATH_TOPICS[selectedTopic].icon}</span>
                  <h2 className="text-xl font-semibold text-tutor-text">
                    {MATH_TOPICS[selectedTopic].name}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid gap-4 max-w-3xl">
              {PRACTICE_PROBLEMS[selectedTopic].map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="bordered" className="hover:border-primary-500/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                problem.difficulty === 'easy'
                                  ? 'bg-green-500/20 text-green-400'
                                  : problem.difficulty === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              )}
                            >
                              {problem.difficulty}
                            </span>
                            <span className="text-tutor-muted text-sm">Problem {index + 1}</span>
                          </div>
                          <p className="text-tutor-text text-lg">{problem.question}</p>
                        </div>
                        <Link
                          href={`/tutor?problem=${encodeURIComponent(problem.question)}`}
                        >
                          <Button>
                            <Play className="w-4 h-4 mr-2" />
                            Solve
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Subtopics */}
            <div className="mt-8 max-w-3xl">
              <h3 className="text-lg font-semibold text-tutor-text mb-4">Subtopics</h3>
              <div className="flex flex-wrap gap-2">
                {MATH_TOPICS[selectedTopic].subTopics.map((subtopic) => (
                  <span
                    key={subtopic}
                    className="px-3 py-1.5 bg-tutor-card border border-tutor-border rounded-full text-sm text-tutor-muted hover:border-primary-500/50 cursor-pointer transition-colors"
                  >
                    {subtopic}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
