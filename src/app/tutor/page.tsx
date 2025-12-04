'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Lightbulb,
  Upload,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Camera,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading, LoadingDots } from '@/components/ui/Loading';
import { useTutorSession } from '@/hooks/useTutorSession';
import { useOCR } from '@/hooks/useOCR';
import { Message, HintLevel } from '@/types';
import { HINT_LEVEL_DESCRIPTIONS } from '@/constants/hintLevels';
import { MATH_TOPICS, TOPIC_COLORS } from '@/constants/topics';
import { cn, formatDate } from '@/lib/utils';

export default function TutorPage() {
  const [inputMode, setInputMode] = useState<'type' | 'upload'>('type');
  const [inputText, setInputText] = useState('');
  const [showHintOptions, setShowHintOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    currentSession,
    isLoading,
    error,
    analyzeProblem,
    requestHint,
    submitAnswer,
    finishSession,
    abandonSession,
  } = useTutorSession();

  const { processImage, isProcessing: isOCRProcessing } = useOCR();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleSubmitProblem = async () => {
    if (!inputText.trim()) return;
    await analyzeProblem(inputText.trim());
    setInputText('');
  };

  const handleSubmitAnswer = async () => {
    if (!inputText.trim()) return;
    await submitAnswer(inputText.trim());
    setInputText('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await processImage(file);
    if (text) {
      setInputText(text);
      setInputMode('type');
    }
  };

  const handleRequestHint = async (level?: HintLevel) => {
    setShowHintOptions(false);
    await requestHint(level);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentSession?.problem) {
        handleSubmitAnswer();
      } else {
        handleSubmitProblem();
      }
    }
  };

  return (
    <div className="min-h-screen bg-tutor-bg">
      {/* Header */}
      <header className="bg-tutor-card border-b border-tutor-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-tutor-muted hover:text-tutor-text transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-tutor-text">Math Tutor</h1>
                {currentSession?.problem && (
                  <p className="text-sm text-tutor-muted">
                    {MATH_TOPICS[currentSession.problem.topic]?.icon}{' '}
                    {MATH_TOPICS[currentSession.problem.topic]?.name} •{' '}
                    Step {currentSession.currentStep + 1} of {currentSession.problem.steps.length}
                  </p>
                )}
              </div>
            </div>

            {currentSession?.problem && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-tutor-muted">
                  Hints used: {currentSession.hintsUsed}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={abandonSession}
                  className="text-red-400 hover:text-red-300"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  New Problem
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar for current problem */}
        {currentSession?.problem && (
          <div className="h-1 bg-tutor-border">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
              style={{
                width: `${((currentSession.currentStep + 1) / currentSession.problem.steps.length) * 100}%`,
              }}
            />
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card variant="bordered" className="h-[calc(100vh-200px)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!currentSession?.problem ? (
                  <WelcomeMessage />
                ) : (
                  <>
                    {/* Problem Display */}
                    <div className="bg-tutor-bg rounded-lg p-4 border border-tutor-border">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-white',
                          TOPIC_COLORS[currentSession.problem.topic] || 'bg-primary-500'
                        )}>
                          {MATH_TOPICS[currentSession.problem.topic]?.icon || '📐'}
                        </div>
                        <div>
                          <h3 className="font-medium text-tutor-text mb-1">Your Problem</h3>
                          <p className="text-tutor-muted">{currentSession.problem.originalText}</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <AnimatePresence>
                      {currentSession.messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </AnimatePresence>

                    {isLoading && (
                      <div className="flex items-center gap-2 text-tutor-muted">
                        <LoadingDots />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-tutor-border p-4">
                {error && (
                  <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Input Mode Toggle (only when no active problem) */}
                {!currentSession?.problem && (
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => setInputMode('type')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                        inputMode === 'type'
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-tutor-muted hover:bg-tutor-border'
                      )}
                    >
                      <Keyboard className="w-4 h-4" />
                      Type
                    </button>
                    <button
                      onClick={() => setInputMode('upload')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                        inputMode === 'upload'
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-tutor-muted hover:bg-tutor-border'
                      )}
                    >
                      <Camera className="w-4 h-4" />
                      Upload Photo
                    </button>
                  </div>
                )}

                {inputMode === 'upload' && !currentSession?.problem ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-tutor-border rounded-lg p-8 text-center cursor-pointer hover:border-primary-500/50 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {isOCRProcessing ? (
                      <Loading text="Processing image..." />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-tutor-muted mx-auto mb-3" />
                        <p className="text-tutor-muted">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-tutor-muted/60 mt-1">
                          PNG, JPG up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          currentSession?.problem
                            ? "Type your answer or work here..."
                            : "Type your math problem here..."
                        }
                        className="w-full px-4 py-3 bg-tutor-bg border border-tutor-border rounded-lg text-tutor-text placeholder-tutor-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      {currentSession?.problem && (
                        <div className="relative">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowHintOptions(!showHintOptions)}
                            disabled={isLoading}
                          >
                            <Lightbulb className="w-4 h-4" />
                          </Button>

                          {/* Hint Options Dropdown */}
                          <AnimatePresence>
                            {showHintOptions && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full right-0 mb-2 w-64 bg-tutor-card border border-tutor-border rounded-lg shadow-xl overflow-hidden"
                              >
                                {([1, 2, 3, 4, 5] as HintLevel[]).map((level) => (
                                  <button
                                    key={level}
                                    onClick={() => handleRequestHint(level)}
                                    disabled={level < currentSession.currentHintLevel}
                                    className={cn(
                                      'w-full px-4 py-3 text-left hover:bg-tutor-border transition-colors flex items-center gap-3',
                                      level < currentSession.currentHintLevel && 'opacity-50 cursor-not-allowed'
                                    )}
                                  >
                                    <span className="text-xl">{HINT_LEVEL_DESCRIPTIONS[level].icon}</span>
                                    <div>
                                      <p className="text-sm font-medium text-tutor-text">
                                        {HINT_LEVEL_DESCRIPTIONS[level].name}
                                      </p>
                                      <p className="text-xs text-tutor-muted">
                                        {HINT_LEVEL_DESCRIPTIONS[level].description}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      <Button
                        onClick={currentSession?.problem ? handleSubmitAnswer : handleSubmitProblem}
                        disabled={!inputText.trim() || isLoading}
                        isLoading={isLoading}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Current Step Card */}
            {currentSession?.problem && (
              <Card variant="bordered">
                <h3 className="font-semibold text-tutor-text mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-400" />
                  Current Step
                </h3>
                <div className="space-y-3">
                  {currentSession.problem.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg transition-colors',
                        index === currentSession.currentStep
                          ? 'bg-primary-500/10 border border-primary-500/20'
                          : index < currentSession.currentStep
                          ? 'bg-green-500/10'
                          : 'bg-tutor-bg'
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                          index < currentSession.currentStep
                            ? 'bg-green-500 text-white'
                            : index === currentSession.currentStep
                            ? 'bg-primary-500 text-white'
                            : 'bg-tutor-border text-tutor-muted'
                        )}
                      >
                        {index < currentSession.currentStep ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            'text-sm',
                            index === currentSession.currentStep
                              ? 'text-tutor-text'
                              : 'text-tutor-muted'
                          )}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Tips */}
            <Card variant="bordered">
              <h3 className="font-semibold text-tutor-text mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent-400" />
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-tutor-muted">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-primary-400" />
                  Try to solve each step before asking for hints
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-primary-400" />
                  Use the hint ladder from gentle to specific
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-primary-400" />
                  Show your work - partial answers are welcome!
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-primary-400" />
                  It's okay to make mistakes - that's how we learn
                </li>
              </ul>
            </Card>

            {/* Session Stats */}
            {currentSession && (
              <Card variant="bordered">
                <h3 className="font-semibold text-tutor-text mb-3">Session Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-tutor-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary-400">
                      {currentSession.hintsUsed}
                    </p>
                    <p className="text-xs text-tutor-muted">Hints Used</p>
                  </div>
                  <div className="bg-tutor-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-accent-400">
                      {currentSession.attemptsMade}
                    </p>
                    <p className="text-xs text-tutor-muted">Attempts</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Welcome Message Component
function WelcomeMessage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-tutor-text mb-3">
          Hi! I'm your Math Tutor 👋
        </h2>
        <p className="text-tutor-muted mb-6">
          Share a math problem with me, and I'll help you work through it step by step. 
          I won't just give you the answer - I'll help you understand!
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Algebra', 'Geometry', 'Calculus', 'Statistics'].map((topic) => (
            <span
              key={topic}
              className="px-3 py-1 bg-tutor-border rounded-full text-sm text-tutor-muted"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary-500 text-white rounded-br-md'
            : 'bg-tutor-border text-tutor-text rounded-bl-md'
        )}
      >
        {/* Message type indicator */}
        {message.type === 'hint' && !isUser && (
          <div className="flex items-center gap-1 text-xs text-primary-400 mb-1">
            <Lightbulb className="w-3 h-3" />
            Hint Level {message.metadata?.hintLevel}
          </div>
        )}
        {message.type === 'feedback' && !isUser && (
          <div className="flex items-center gap-1 text-xs mb-1">
            {message.metadata?.isCorrect ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400">Let's try again</span>
              </>
            )}
          </div>
        )}

        <p className="whitespace-pre-wrap">{message.content}</p>

        <p
          className={cn(
            'text-xs mt-2',
            isUser ? 'text-primary-200' : 'text-tutor-muted'
          )}
        >
          {formatDate(new Date(message.timestamp))}
        </p>
      </div>
    </motion.div>
  );
}
