import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'border-2 border-tutor-border border-t-primary-500 rounded-full animate-spin',
          sizes[size]
        )}
      />
      {text && <p className="text-tutor-muted text-sm">{text}</p>}
    </div>
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-tutor-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-tutor-border border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-tutor-muted">Loading TAMARINI...</p>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-tutor-border/50 rounded animate-pulse',
        className
      )}
    />
  );
}
