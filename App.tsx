
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
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white bg-[#030303]">
      <Header />
      
      {status.step !== 'idle' && status.step !== 'error' && (
        <LoadingOverlay status={status.message} progress={status.progress} />
      )}

      <main className="flex-1 flex flex-col items-center">
        {/* Input Phase */}
        {!feed && (
          <section className="w-full max-w-4xl px-6 py-20 flex flex-col items-center text-center">
            <div className="space-y-6 animate-slide-in mb-16">
              <h2 className="text-6xl md:text-8xl font-brand font-black uppercase italic tracking-tighter leading-[0.9]">
                Viral <span className="gradient-text">Momentum.</span><br/>
                <span className="text-2xl md:text-4xl opacity-30 tracking-widest uppercase">Retention Engineered.</span>
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto text-lg font-medium">
                The "South Park Rule" engine for content creators. <br/>
                Zero fluff. All narrative drive.
              </p>
            </div>

            <div className="w-full glass-panel p-3 rounded-[3rem] shadow-2xl border border-white/5 relative group mb-12">
              <div className="relative flex flex-col md:flex-row gap-2">
                <input 
                  type="text" 
                  placeholder="Enter your hook or topic..."
                  className="flex-1 bg-transparent border-none focus:ring-0 p-8 text-xl md:text-2xl font-bold outline-none placeholder:text-white/10"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={!topic || status.step !== 'idle'}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 px-12 py-6 rounded-[2rem] text-xl font-black italic uppercase transition-all flex items-center justify-center gap-4 whitespace-nowrap shadow-xl group"
                >
                  Engineer
                  <svg className="group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
               <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block italic">Slides</span>
                  <div className="flex items-center gap-4">
                     <input type="range" min="1" max="8" value={slideCount} onChange={(e) => setSlideCount(parseInt(e.target.value))} className="flex-1 accent-indigo-500"/>
                     <span className="text-xl font-black italic">{slideCount}</span>
                  </div>
               </div>
               <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block italic">Ratio</span>
                  <div className="flex bg-black/40 p-1 rounded-xl">
                    {['1:1', '9:16'].map(r => (
                      <button key={r} onClick={() => setAspectRatio(r as AspectRatio)} className={`flex-1 py-2 text-[10px] font-black uppercase italic rounded-lg transition-all ${aspectRatio === r ? 'bg-white text-black' : 'text-gray-500'}`}>{r}</button>
                    ))}
                  </div>
               </div>
               <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block italic">Style</span>
                  <select value={style} onChange={(e) => setStyle(e.target.value as VisualStyle)} className="w-full bg-transparent border-none text-[10px] font-black uppercase italic outline-none">
                    {Object.values(VisualStyle).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
               </div>
            </div>
          </section>
        )}

        {/* Workstation Phase */}
        {feed && (
          <section className="w-full h-[calc(100vh-80px)] overflow-hidden flex flex-col animate-slide-in">
            {/* Context bar */}
            <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <button onClick={() => setFeed(null)} className="text-[10px] font-black uppercase italic text-gray-500 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Back to Lab
                  </button>
                  <h3 className="hidden md:block text-sm font-bold italic text-white/40 truncate max-w-[300px]">Topic: {feed.topic}</h3>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest italic text-emerald-400">Viral Engine Active</span>
                   </div>
                   <button 
                    onClick={() => handleCopyText(combinedBundle, 'Full Bundle')}
                    className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase italic hover:bg-indigo-400 transition-colors shadow-lg"
                   >
                     Export Bundle
                   </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Pane: Visual Preview Container */}
              <div className="flex-1 overflow-y-auto bg-neutral-950/50 p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12">
                  <div className="text-center space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 italic">Visual Sequence</h4>
                    <p className="text-gray-500 text-xs font-medium">Scroll to preview engineered frames</p>
                  </div>
                  
                  {/* Vertical Mockup Feed */}
                  <div className="flex flex-col items-center gap-12 pb-20">
                    {feed.slides.map((slide, idx) => (
                      <div key={slide.id} className="relative w-full max-w-[420px] group">
                        <SlideCard 
                          slide={slide} 
                          style={feed.style} 
                          onDownload={handleDownloadImage}
                          onCopy={handleCopyImage}
                        />
                        {idx < feed.slides.length - 1 && (
                          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
                             <div className="flex flex-col items-center gap-1">
                                <div className="w-px h-6 bg-gradient-to-b from-indigo-500 to-transparent"></div>
                                <div className="bg-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 px-3 py-1 rounded-full">
                                  <span className="text-[8px] font-black uppercase italic text-indigo-400 tracking-widest">
                                    {feed.slides[idx + 1].momentumBridge || 'THEN'}
                                  </span>
                                </div>
                                <div className="w-px h-6 bg-gradient-to-t from-indigo-500 to-transparent"></div>
                             </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Pane: Narrative Blueprint */}
              <div className="w-full lg:w-[450px] border-l border-white/5 bg-[#080808] overflow-y-auto p-8 custom-scrollbar space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">Narrative Engine</h4>
                      <h2 className="text-2xl font-brand font-black italic uppercase tracking-tighter">The Blueprint</h2>
                    </div>

                    {/* Hook Analysis Card */}
                    <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
                       <div className="absolute -right-4 -top-4 text-8xl font-black text-indigo-500/5 rotate-12">HOOK</div>
                       <div className="relative space-y-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 italic bg-indigo-500/10 px-3 py-1 rounded-full">Retention Strategy</span>
                          <p className="text-sm text-gray-200 font-bold italic leading-relaxed">
                            "{feed.hookAnalysis}"
                          </p>
                       </div>
                    </div>

                    {/* Full Script Console */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-black/40 space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 italic">Full Script Console</span>
                          <button onClick={() => handleCopyText(fullScript, 'Script')} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-indigo-400">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          </button>
                       </div>
                       <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar text-sm font-bold text-gray-300 italic whitespace-pre-line leading-relaxed selection:bg-indigo-500">
                          {fullScript}
                       </div>
                       <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-gray-600 uppercase tracking-tighter">
                          <span>{feed.totalWords} Words</span>
                          <span className="text-emerald-500 italic flex items-center gap-1">
                             <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                             Optimized
                          </span>
                       </div>
                    </div>

                    {/* Metadata Bundle */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-black/40 space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 italic">Distribution Hub</span>
                          <button onClick={() => handleCopyText(hashtagText, 'Hashtags')} className="text-[10px] font-black text-indigo-400 hover:text-white uppercase italic underline underline-offset-4">Copy Tags</button>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {feed.hashtags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-black rounded-xl text-[10px] font-black text-gray-500 border border-white/5 uppercase italic">
                              #{tag.replace(/^#/, '')}
                            </span>
                          ))}
                       </div>
                    </div>

                    {/* Pro Tools */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col gap-1">
                          <span className="text-[8px] font-black text-gray-600 uppercase">Engine</span>
                          <span className="text-[10px] font-black text-white italic truncate">{feed.style}</span>
                       </div>
                       <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex flex-col gap-1">
                          <span className="text-[8px] font-black text-gray-600 uppercase">Quality</span>
                          <span className="text-[10px] font-black text-emerald-500 italic uppercase">Verified</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Persistent Lab Footer (Only if not in Workstation) */}
      {!feed && (
        <footer className="py-12 px-8 border-t border-white/5 text-center mt-auto bg-[#050505]">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center font-brand font-black text-white italic text-xs">M</div>
            <p className="text-[10px] uppercase font-black tracking-[0.5em] text-gray-700">MomentumAI Engineering</p>
          </div>
          <p className="text-[8px] uppercase font-black tracking-widest text-gray-800">
            Strictly Optimized for Narrative Flow • Built for the modern creator economy
          </p>
        </footer>
      )}
    </div>
  );
};

export default App;
