import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const SkeletonLoader = ({ count = 5 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-16 bg-[#F0EEE4] rounded-2xl w-full flex items-center justify-between px-6 border border-[#C5C2B4]/40"
        >
          <div className="space-y-2">
            <div className="h-4 bg-[#C5C2B4]/50 rounded-full w-40" />
            <div className="h-3 bg-[#C5C2B4]/30 rounded-full w-24" />
          </div>
          <div className="h-6 bg-[#C5C2B4]/40 rounded-full w-20" />
          <div className="h-8 bg-[#C5C2B4]/50 rounded-full w-24" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonPage = () => {
  return (
    <div className="min-h-screen bg-[#E7E4D8] flex items-center justify-center p-6">
      <div className="space-y-4 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 bg-[#2A4B3A]/10 text-[#2A4B3A] rounded-full flex items-center justify-center mx-auto shadow-md"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
        <p className="text-xs font-bold text-[#575D58] uppercase tracking-wider animate-pulse">
          Loading workspace...
        </p>
      </div>
    </div>
  );
};

const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-[#2A4B3A]/20 border-t-[#2A4B3A] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#2A4B3A] animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-bold text-[#575D58] uppercase tracking-wider animate-pulse">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#E7E4D8]/80 backdrop-blur-md flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center">{content}</div>;
};

export default LoadingSpinner;
