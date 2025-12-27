
import React, { useState, useEffect } from 'react';

// Use type assertion instead of global declaration to avoid conflicts with platform-provided AIStudio type
const getAiStudio = () => (window as any).aistudio;

const Header: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const aistudio = getAiStudio();
        if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
          const selected = await aistudio.hasSelectedApiKey();
          setHasKey(selected);
        }
      } catch (e) {
        console.error("Error checking API key status:", e);
      }
    };
    checkKey();
  }, []);

  const handleSetKey = async () => {
    try {
      const aistudio = getAiStudio();
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
        setHasKey(true);
      } else {
        alert("API Key configuration is only available in the AI Studio environment.");
      }
    } catch (e) {
      console.error("Error opening key selection:", e);
    }
  };

  return (
    <header className="py-6 px-8 flex justify-between items-center border-b border-white/5 sticky top-0 z-50 glass-panel">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-brand font-black text-white italic">M</div>
        <h1 className="text-xl font-brand font-black tracking-tighter uppercase italic">
          Momentum<span className="text-indigo-500">AI</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors italic"
        >
          Billing Docs
        </a>
        <button 
          onClick={handleSetKey}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
            hasKey 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          {hasKey ? 'API Key Active' : 'Configure API Key'}
        </button>
      </div>
    </header>
  );
};

export default Header;
