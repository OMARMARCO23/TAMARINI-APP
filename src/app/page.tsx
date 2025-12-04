'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function HomePage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Step-by-Step Guidance',
      description: 'Never just get the answer. Learn the process through guided hints that build understanding.',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Personalized Hints',
      description: 'Get hints tailored to your level - from gentle nudges to detailed explanations.',
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Concept Checks',
      description: 'Verify your understanding with quick quizzes after solving each problem.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Track Progress',
      description: 'See your improvement over time and identify areas that need more practice.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-tutor-bg to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TAMARINI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/progress">
              <Button variant="ghost">My Progress</Button>
            </Link>
            <Link href="/tutor">
              <Button>Start Learning</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-primary-400 text-sm font-medium">AI-Powered Math Tutoring</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your Personal Math Tutor,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
              Always in Your Pocket
            </span>
          </h1>
          
          <p className="text-xl text-tutor-muted mb-8 max-w-2xl mx-auto">
            Learn math the right way. TAMARINI guides you through problems step-by-step, 
            helping you understand concepts instead of just copying answers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tutor">
              <Button size="lg" className="w-full sm:w-auto">
                Start Solving Problems
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/practice">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Try Practice Problems
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
        >
          {features.map((feature, index) => (
            <Card key={index} variant="bordered" className="hover:border-primary-500/50 transition-colors">
              <CardContent>
                <div className="w-14 h-14 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-tutor-muted">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Share Your Problem',
                description: 'Type your math problem or take a photo of it. TAMARINI will analyze and understand what you need help with.',
              },
              {
                step: '2',
                title: 'Get Guided Hints',
                description: 'Instead of showing the answer, TAMARINI asks you guiding questions and provides hints that help you think through the problem.',
              },
              {
                step: '3',
                title: 'Learn & Verify',
                description: 'Work through each step with support, then test your understanding with concept check questions.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block flex-1 h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-tutor-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-24 text-center"
        >
          <Card variant="elevated" className="bg-gradient-to-br from-primary-900/50 to-accent-900/50 border border-primary-500/20">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Master Math?</h2>
              <p className="text-tutor-muted mb-8 max-w-xl mx-auto">
                Stop memorizing answers. Start understanding concepts. 
                Your personal math tutor is waiting.
              </p>
              <Link href="/tutor">
                <Button size="lg">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-tutor-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">TAMARINI</span>
          </div>
          <p className="text-tutor-muted text-sm">
            © {new Date().getFullYear()} TAMARINI. Helping students think, not copy.
          </p>
        </div>
      </footer>
    </div>
  );
}
