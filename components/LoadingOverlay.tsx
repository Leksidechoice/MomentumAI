
import React from 'react';

interface LoadingOverlayProps {
  status: string;
  progress: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ status, progress }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
      <div className="max-w-md w-full px-6 text-center space-y-8">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
          <div 
            className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"
            style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl font-brand font-black italic">
            {Math.round(progress)}%
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-brand font-bold uppercase tracking-tight italic gradient-text">Engineering Viral Momentum</h2>
          <p className="text-gray-400 font-medium">{status}</p>
        </div>

        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-right from-indigo-500 to-emerald-500 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 uppercase font-bold tracking-widest pt-8">
          <div className="flex items-center gap-2 justify-center">
            <span className={`w-2 h-2 rounded-full ${progress > 10 ? 'bg-indigo-500' : 'bg-gray-700'}`}></span>
            Pro-Script Engine
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className={`w-2 h-2 rounded-full ${progress > 40 ? 'bg-indigo-500' : 'bg-gray-700'}`}></span>
            South Park Logic
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className={`w-2 h-2 rounded-full ${progress > 70 ? 'bg-indigo-500' : 'bg-gray-700'}`}></span>
            Image Synth
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className={`w-2 h-2 rounded-full ${progress > 95 ? 'bg-indigo-500' : 'bg-gray-700'}`}></span>
            Metadata Opt
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
