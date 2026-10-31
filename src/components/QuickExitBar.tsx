import React, { useState } from 'react';
import { ExternalLink, ShieldAlert, X } from 'lucide-react';

interface QuickExitBarProps {
  onQuickExit: () => void;
}

export const QuickExitBar: React.FC<QuickExitBarProps> = ({ onQuickExit }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div 
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 max-w-[calc(100vw-24px)]"
      role="complementary"
      aria-label="Emergency quick exit control"
    >
      <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-900/90 text-white rounded-2xl shadow-xl backdrop-blur-md border border-slate-700">
        
        {/* Quick Exit Action */}
        <button
          type="button"
          onClick={onQuickExit}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
          aria-label="Quick Exit to neutral website"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Quick Exit</span>
        </button>

        {/* Short explanation for victims */}
        <div className="hidden sm:block text-[11px] text-slate-300 pr-2">
          Leaves immediately to Google <span className="text-slate-400">(does not erase history)</span>
        </div>

        {/* Dismiss subtle close */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Dismiss quick exit bar"
          title="Dismiss floating shortcut (header quick exit remains active)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
