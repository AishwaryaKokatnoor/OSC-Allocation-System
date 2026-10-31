import React from 'react';
import { HeartHandshake, Phone, ShieldCheck, Heart, ExternalLink, Type } from 'lucide-react';
import { InfoModalType } from './modals/InfoModal';

interface FooterProps {
  onOpenInfo: (type: InfoModalType) => void;
  onOpenEmergency: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenInfo,
  onOpenEmergency,
  fontSize,
  onChangeFontSize
}) => {
  return (
    <footer className="bg-[#21312C] text-[#FAF9F5] pt-12 pb-8 border-t border-[#354F52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#354F52]/60">
          
          {/* Brand Info (Cols 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#52796F] text-white flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Sakhi<span className="text-[#A3B899]">Link</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#D0DDD0]/80 leading-relaxed max-w-sm">
              Connecting individuals to integrated One Stop Centres (OSCs) across India. Providing immediate sanctuary, medical care, legal aid, police assistance, and psychological counselling under the Nirbhaya Fund initiative.
            </p>
            <div className="text-xs text-[#A3B899] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Ministry of Women & Child Development, Govt of India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3B899]">
              Victim Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenInfo('about')}
                  className="text-[#D0DDD0]/80 hover:text-white transition-colors"
                >
                  About One Stop Centres
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfo('privacy')}
                  className="text-[#D0DDD0]/80 hover:text-white transition-colors"
                >
                  Privacy & Data Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfo('faq')}
                  className="text-[#D0DDD0]/80 hover:text-white transition-colors"
                >
                  Help & Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfo('accessibility')}
                  className="text-[#D0DDD0]/80 hover:text-white transition-colors"
                >
                  Accessibility Guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3B899]">
              Emergency Helplines
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="tel:112"
                  className="flex items-center gap-1.5 text-red-300 font-bold hover:text-red-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>112 (National Emergency)</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:181"
                  className="flex items-center gap-1.5 text-[#D0DDD0]/90 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>181 (Women Helpline)</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:1091"
                  className="flex items-center gap-1.5 text-[#D0DDD0]/90 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>1091 (Women in Distress)</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:1098"
                  className="flex items-center gap-1.5 text-[#D0DDD0]/90 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>1098 (Childline Helpline)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Accessibility Settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3B899]">
              Accessibility Controls
            </h4>
            <div className="space-y-2">
              <div className="text-xs text-[#D0DDD0]/70 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                <span>Text Size:</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#2F453F] rounded-lg border border-[#354F52]">
                <button
                  type="button"
                  onClick={() => onChangeFontSize('normal')}
                  className={`flex-1 py-1 text-xs rounded transition-colors ${
                    fontSize === 'normal'
                      ? 'bg-[#52796F] text-white font-bold'
                      : 'text-[#D0DDD0]/70 hover:text-white'
                  }`}
                  aria-label="Normal text size"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontSize('large')}
                  className={`flex-1 py-1 text-sm rounded transition-colors ${
                    fontSize === 'large'
                      ? 'bg-[#52796F] text-white font-bold'
                      : 'text-[#D0DDD0]/70 hover:text-white'
                  }`}
                  aria-label="Large text size"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontSize('xlarge')}
                  className={`flex-1 py-1 text-base rounded transition-colors ${
                    fontSize === 'xlarge'
                      ? 'bg-[#52796F] text-white font-bold'
                      : 'text-[#D0DDD0]/70 hover:text-white'
                  }`}
                  aria-label="Extra large text size"
                >
                  A++
                </button>
              </div>

              <button
                onClick={() => onOpenInfo('accessibility')}
                className="text-[11px] text-[#A3B899] hover:underline block pt-1"
              >
                Screen Reader & Keyboard Info
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D0DDD0]/60">
          <p>
            © {new Date().getFullYear()} SakhiLink. Public safety portal for One Stop Centres (OSCs).
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenInfo('privacy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onOpenInfo('about')}
              className="hover:text-white transition-colors"
            >
              Statutory Terms
            </button>
            <span>·</span>
            <button
              onClick={onOpenEmergency}
              className="text-red-300 hover:text-red-200 transition-colors"
            >
              Emergency 112
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
