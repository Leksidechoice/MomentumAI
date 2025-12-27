
import React, { useState } from 'react';
import { VisualStyle, Feed, Slide, GenerationStatus, AspectRatio, ImageQuality } from './types';
import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';
import SlideCard from './components/SlideCard';
import { generateScript, generateSlideImage } from './services/geminiService';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(3);
  const [style, setStyle] = useState<VisualStyle>(VisualStyle.CINEMATIC);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [quality, setQuality] = useState<ImageQuality>(ImageQuality.STANDARD);
  const [status, setStatus] = useState<GenerationStatus>({ step: 'idle', message: '', progress: 0 });
  const [feed, setFeed] = useState<Feed | null>(null);

  const showNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-8 right-8 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black italic uppercase text-xs z-50 animate-bounce shadow-2xl border border-indigo-400/30';
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showNotification(`${label} Copied!`);
  };

  const handleCopyImage = async (dataUrl: string) => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      showNotification('Image Copied!');
    } catch (err) {
      console.error('Failed to copy image:', err);
      showNotification('Copy Failed');
    }
  };

  const handleDownloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `momentum-ai-${topic.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.png`;
    link.click();
  };
  
  const handleGenerate = async () => {
    if (!topic.trim()) return;

    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
      }
    }

    try {
      setStatus({ step: 'scripting', message: 'Analyzing topic & engineering narrative bridges...', progress: 10 });
      setFeed(null);

      const scriptResult = await generateScript(topic, slideCount, style);
      
      const newFeed: Feed = {
        id: Math.random().toString(36).substr(2, 9),
        topic,
        style,
        aspectRatio,
        quality,
        slides: scriptResult.slides.map((s, idx) => ({
          ...s,
          id: `${idx}`,
          generatingImage: true
        })) as Slide[],
        hashtags: scriptResult.hashtags,
        totalWords: scriptResult.slides.reduce((acc, s) => acc + (s.text?.split(' ').length || 0), 0),
        hookAnalysis: scriptResult.hookAnalysis
      };

      setFeed(newFeed);
      setStatus({ step: 'visualizing', message: 'Synthesizing viral aesthetics...', progress: 40 });

      const updatedSlides = [...newFeed.slides];
      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];
        setStatus(prev => ({
          ...prev,
          message: `Visualizing ${aspectRatio} Frame ${i + 1} of ${updatedSlides.length}...`,
          progress: 40 + (i / updatedSlides.length) * 55
        }));

        try {
          const imageUrl = await generateSlideImage(slide.imagePrompt, style, aspectRatio, quality);
          updatedSlides[i] = { ...slide, imageUrl, generatingImage: false };
          setFeed(prev => prev ? { ...prev, slides: [...updatedSlides] } : null);
        } catch (err) {
          console.error(`Failed image generation`, err);
          updatedSlides[i] = { ...slide, generatingImage: false };
          setFeed(prev => prev ? { ...prev, slides: [...updatedSlides] } : null);
        }
      }

      setStatus({ step: 'completed', message: 'Momentum Engineered!', progress: 100 });
      setTimeout(() => setStatus(prev => ({ ...prev, step: 'idle' })), 1000);

    } catch (error: any) {
      console.error("Generation failed:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        const aistudio = (window as any).aistudio;
        if (aistudio) await aistudio.openSelectKey();
      }
      setStatus({ step: 'error', message: 'Engine stall. Check API Key.', progress: 0 });
      setTimeout(() => setStatus(prev => ({ ...prev, step: 'idle' })), 3000);
    }
  };

  const fullScript = feed?.slides.map(s => s.text).join('\n\n') || '';
  const hashtagText = feed?.hashtags.map(t => `#${t.replace(/^#/, '')}`).join(' ') || '';
  const combinedBundle = `${fullScript}\n\n.\n.\n.\n${hashtagText}`;

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
      <Header />
      
      {status.step !== 'idle' && status.step !== 'error' && (
        <LoadingOverlay status={status.message} progress={status.progress} />
      )}

      <main className="flex-1 flex flex-col items-center">
        {/* Hero & Input */}
        <section className={`w-full max-w-6xl px-6 py-12 transition-all duration-1000 ${feed ? 'opacity-0 h-0 overflow-hidden pointer-events-none -translate-y-20' : 'opacity-100'}`}>
          <div className="text-center mb-16 space-y-6 animate-slide-in">
            <h2 className="text-5xl md:text-8xl font-brand font-black uppercase italic tracking-tighter leading-[0.9]">
              Viral <span className="gradient-text">Momentum.</span><br/>
              <span className="text-3xl md:text-5xl opacity-40">Retention Engineered.</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl font-medium">
              We use the "South Park Rule" to engineer narrative flow. <br className="hidden md:block"/>
              High-retention scripts. Cinematic visuals. Zero fluff.
            </p>
          </div>

          <div className="glass-panel p-3 rounded-[3rem] shadow-2xl shadow-indigo-500/10 border border-white/5 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 rounded-[3rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative flex flex-col md:flex-row gap-2">
              <input 
                type="text" 
                placeholder="What story stops the scroll today?"
                className="flex-1 bg-transparent border-none focus:ring-0 p-8 text-xl md:text-2xl font-bold outline-none placeholder:text-white/10"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button 
                onClick={handleGenerate}
                disabled={!topic || status.step !== 'idle'}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 px-16 py-6 rounded-[2rem] text-xl font-black italic uppercase transition-all flex items-center justify-center gap-4 whitespace-nowrap shadow-xl"
              >
                Engineer
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-4 border border-white/5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">Aspect Ratio</label>
              <div className="flex gap-3">
                {['1:1', '9:16'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio as AspectRatio)}
                    className={`flex-1 py-4 rounded-2xl transition-all border font-black italic text-xs ${aspectRatio === ratio ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10'}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] space-y-4 border border-white/5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">Slides: {slideCount}</label>
              <div className="pt-2">
                <input 
                  type="range" min="1" max="8" step="1" 
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                />
                <div className="flex justify-between mt-2 text-[10px] font-black text-white/20 uppercase italic">
                   <span>Snack</span>
                   <span>Binge</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2.5rem] space-y-4 border border-white/5 lg:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">Engine Tuning</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(VisualStyle).map(v => (
                  <button
                    key={v}
                    onClick={() => setStyle(v)}
                    className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest rounded-xl border transition-all ${style === v ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/5 text-white/40'}`}
                  >
                    {v}
                  </button>
                ))}
                <button
                    onClick={() => setQuality(quality === ImageQuality.STANDARD ? ImageQuality.ULTRA : ImageQuality.STANDARD)}
                    className={`px-4 py-3 text-[10px] uppercase font-black tracking-widest rounded-xl border transition-all ${quality === ImageQuality.ULTRA ? 'bg-emerald-600 border-emerald-500' : 'bg-white/5 border-white/5 text-white/40'}`}
                >
                  {quality === ImageQuality.ULTRA ? 'Ultra Res Active' : 'Go Ultra'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Momentum Delivered */}
        {feed && (
          <section className="w-full max-w-7xl px-6 py-12 animate-slide-in">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Visuals Canvas */}
              <div className="lg:w-3/5 space-y-8">
                 <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setFeed(null)}
                      className="flex items-center gap-3 text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase italic bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      Re-Engineer
                    </button>
                    <div className="flex gap-2">
                       <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-white/5">{feed.aspectRatio}</span>
                       <span className="text-[10px] bg-emerald-500 px-3 py-1 rounded-full text-black font-black uppercase tracking-tighter italic">Viral Verified</span>
                    </div>
                 </div>

                 <div className="flex gap-6 overflow-x-auto pb-8 slide-container snap-x snap-mandatory">
                    {feed.slides.map((s, idx) => (
                      <div key={s.id} className="flex-shrink-0 snap-center">
                         <SlideCard 
                           slide={s} 
                           style={feed.style} 
                           onDownload={handleDownloadImage}
                           onCopy={handleCopyImage}
                         />
                         <div className="mt-4 flex gap-2">
                            <button 
                                onClick={() => s.imageUrl && handleDownloadImage(s.imageUrl, idx)}
                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase italic text-gray-400 transition-all border border-white/5"
                            >
                                Export Slide {idx + 1}
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Strategy & Script */}
              <div className="lg:w-2/5 space-y-8">
                {/* Hook Strategy Panel */}
                <div className="glass-panel p-8 rounded-[3rem] border border-white/10 bg-indigo-900/10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 italic mb-4 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.05.5-9 4.77-9 9.95 0 5.52 4.48 10 10 10 1.45 0 2.83-.32 4.07-.88l-1.53-2.6c-.79.3-1.64.48-2.54.48z"/></svg>
                      Hook Analysis
                   </h4>
                   <p className="text-sm text-gray-300 font-bold italic leading-relaxed">
                     "{feed.hookAnalysis}"
                   </p>
                </div>

                {/* Final Script Panel */}
                <div className="glass-panel p-8 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6">
                    <button 
                      onClick={() => handleCopyText(fullScript, 'Script')}
                      className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg hover:scale-110 transition-all active:scale-95"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic mb-6">Optimized Narrative</h4>
                  <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto pr-4 text-gray-200 leading-relaxed font-bold whitespace-pre-line text-sm slide-container italic p-6 rounded-2xl bg-white/5 border border-white/5">
                    {fullScript}
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-gray-600">{feed.totalWords} words generated</span>
                    <span className="text-[10px] font-black uppercase text-emerald-400 italic flex items-center gap-1">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      Facebook Ready
                    </span>
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-[3rem] border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">Metadata Bundle</h4>
                    <button onClick={() => handleCopyText(hashtagText, 'Hashtags')} className="text-[10px] font-black uppercase italic text-indigo-400 hover:text-white underline underline-offset-4">Copy All</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {feed.hashtags.map(tag => (
                      <span key={tag} className="px-3 py-2 bg-black/40 rounded-xl text-[10px] font-black text-gray-400 border border-white/5 uppercase italic tracking-tighter">
                        #{tag.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleCopyText(combinedBundle, 'Full Bundle')}
                  className="w-full py-6 bg-white text-black font-black uppercase italic rounded-[2.5rem] text-sm transition-all hover:bg-gray-200 flex items-center justify-center gap-4 shadow-2xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Copy Everything (FB Format)
                </button>
              </div>

            </div>
          </section>
        )}
      </main>

      <footer className="py-12 px-8 border-t border-white/5 text-center mt-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
           <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center font-brand font-black text-white italic text-xs">M</div>
           <p className="text-[10px] uppercase font-black tracking-[0.5em] text-gray-700">MomentumAI Engineering</p>
        </div>
        <p className="text-[8px] uppercase font-black tracking-widest text-gray-800">
           Strictly Optimized for Narrative Flow • Built for the modern creator economy
        </p>
      </footer>
    </div>
  );
};

export default App;
