import React from 'react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenStaffPortal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStaffPortal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D0DDD0] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group focus-visible:outline-hidden">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#3E5C54] text-white flex items-center justify-center shadow-xs group-hover:bg-[#2F453F] transition-colors">
                <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2937]">
                  Sakhi<span className="text-[#3E5C54]">Link</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#52606D] -mt-0.5 tracking-tight truncate max-w-[190px] sm:max-w-none">
                  One Stop Centre Support & Safety Network
                </span>
              </div>
            </a>
          </div>

          {/* Right Action: ONLY Staff Portal Button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onOpenStaffPortal}
              className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#3E5C54] hover:bg-[#2F453F] text-white transition-all shadow-xs border border-[#2F453F] active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Staff Portal</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
