import React from 'react';
import { PhoneCall, AlertTriangle, ShieldAlert } from 'lucide-react';

interface EmergencyBannerProps {
  onOpenEmergencyModal: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  onOpenEmergencyModal
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-50 via-rose-50 to-[#FAF9F5] border-2 border-red-200/90 p-5 sm:p-7 shadow-md overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-red-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left info */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-900">
                Emergency Assistance & 24/7 Helplines
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-red-950 tracking-tight">
              In immediate danger? Call India Emergency Helpline 112
            </h2>

            <p className="text-xs sm:text-sm text-red-900/90 leading-relaxed">
              <strong>Notice:</strong> SakhiLink is a support case coordination and One Stop Centre directory system, <strong>not an emergency dispatch service</strong>. If an attacker is present, if violence is ongoing, or if you need an urgent ambulance or police escort, call <strong>112</strong> or <strong>181</strong> directly.
            </p>
          </div>

          {/* Right action group */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Direct 112 Call */}
            <a
              href="tel:112"
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-md transition-all group"
            >
              <PhoneCall className="w-4 h-4 group-hover:animate-bounce" />
              <span>Call 112 Directly</span>
            </a>

            {/* Emergency Help Button */}
            <button
              type="button"
              onClick={onOpenEmergencyModal}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-red-100/60 active:scale-[0.98] text-red-900 border border-red-300 font-bold text-xs transition-all shadow-xs"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Emergency Help</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
