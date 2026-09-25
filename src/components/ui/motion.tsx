'use client';

import { type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface PageTransitionProps {
  children: ReactNode;
  /** Unique key to trigger transition on route change */
  transitionKey: string;
  className?: string;
}

/**
 * Wraps page content with a fade+slide entrance animation.
 * Automatically disabled when user prefers reduced motion.
 */
export function PageTransition({ children, transitionKey, className }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.0, 0.0, 0.2, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Simple fade-in wrapper for staggered reveals.
 */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.0, 0.0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Scale-in animation for success badges and icons.
 */
export function ScaleIn({ children, delay = 0, className }: ScaleInProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PulseProps {
  children: ReactNode;
  isActive: boolean;
  className?: string;
}

/**
 * Subtle pulsing animation for live/recording indicators.
 */
export function Pulse({ children, isActive, className }: PulseProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        isActive && !shouldReduceMotion
          ? { scale: [1, 1.05, 1], opacity: [1, 0.85, 1] }
          : {}
      }
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
