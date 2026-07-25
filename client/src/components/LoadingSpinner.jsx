import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-3" />
        <p className="text-slate-200 font-medium text-sm tracking-wide">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
      <span className="text-slate-400 text-xs font-medium">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
