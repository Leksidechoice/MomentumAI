
import React, { useState } from 'react';
import { Slide, VisualStyle } from '../types';

interface SlideCardProps {
  slide: Slide;
  style: VisualStyle;
  onDownload?: (url: string, index: number) => void;
  onCopy?: (url: string) => void;
}

const SlideCard: React.FC<SlideCardProps> = ({ slide, style, onDownload, onCopy }) => {
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    if (!slide.imageUrl || !onCopy) return;
    setIsCopying(true);
    await onCopy(slide.imageUrl);
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="flex-shrink-0 w-[300px] md:w-[380px] h-[550px] md:h-[650px] glass-panel rounded-3xl overflow-hidden flex flex-col relative group border border-white/5 hover:border-indigo-500/30 transition-all duration-500 shadow-2xl">
      {/* Top Labels */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="bg-black/60 backdrop-blur-md text-white/90 px-3 py-1 rounded-full text-[10px] font-black italic tracking-widest border border-white/10 uppercase">
          Slide {slide.slideNumber}
        </span>
        {slide.momentumBridge && slide.momentumBridge !== 'HOOK' && (
          <span className="bg-indigo-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black italic tracking-widest border border-indigo-400/30 uppercase">
            {slide.momentumBridge}
          </span>
        )}
      </div>
      
      {/* Image Area */}
      <div className="h-1/2 w-full bg-neutral-900 relative overflow-hidden group/img">
        {slide.imageUrl ? (
          <>
            <img 
              src={slide.imageUrl} 
              alt={`Slide ${slide.slideNumber}`} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10 backdrop-blur-[2px]">
              <button 
                onClick={handleCopy}
                title="Copy to Clipboard"
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-90 shadow-xl"
              >
                {isCopying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                )}
              </button>
              <button 
                onClick={() => onDownload?.(slide.imageUrl!, slide.slideNumber - 1)}
                title="Download Image"
                className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-90 shadow-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-neutral-900 to-neutral-800">
            <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest italic animate-pulse">Synthesizing Visual...</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Text Content */}
      <div className="flex-1 p-6 flex flex-col justify-center bg-black/40 relative">
        <div className="absolute -top-6 left-6 right-6 h-12 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <p className="text-sm md:text-base leading-relaxed text-gray-200 font-medium italic">
          "{slide.text}"
        </p>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-white/5 flex justify-between items-center bg-white/5">
        <div className="text-[9px] font-black uppercase tracking-tighter text-gray-500">
          Retention Optimized
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => slide.imageUrl && window.open(slide.imageUrl, '_blank')}
             title="View Full Size"
             className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg transition-all text-gray-500 hover:text-indigo-400"
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default SlideCard;
