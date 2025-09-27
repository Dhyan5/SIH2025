import React from 'react';
import { motion } from 'motion/react';

export const TypingIndicator = () => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 bg-gray-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
};

export const MessageSlideIn = ({ children, sender }: { children: React.ReactNode; sender: 'ai' | 'user' }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: sender === 'user' ? 20 : -20,
        scale: 0.95
      }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: 1
      }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
};

export const ScoreAnimation = ({ score, delay = 0 }: { score: number; delay?: number }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        delay,
        duration: 0.8,
        type: "spring",
        stiffness: 150,
        damping: 15
      }}
      className="text-3xl font-mono"
    >
      {score}
    </motion.div>
  );
};

export const ChartFadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay,
        duration: 0.6,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export const PulseIcon = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};