import React from 'react';
import { ArrowRight, MapPin, ShieldCheck, HeartHandshake, Lock, PhoneCall, Sparkles } from 'lucide-react';

interface HeroProps {
  onGetHelpNow: () => void;
  onFindNearbyOSC: () => void;
  onEmergencyHelp: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onGetHelpNow,
  onFindNearbyOSC,
  onEmergencyHelp
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:py-20 bg-gradient-to-b from-[#F4F7F4] via-[#FAF9F5] to-[#FAF9F5]">
      {/* Subtle organic background aesthetics */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#E6ECE5]/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#D0DDD0]/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Hero Copy (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Safe & Official Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6ECE5] border border-[#A3B899] text-[#2F453F] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#3E5C54]" />
              <span>Ministry of Women & Child Development · Nirbhaya Initiative</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#1F2937] leading-[1.15] tracking-tight">
              You are not alone. <br className="hidden sm:inline" />
              <span className="text-[#3E5C54]">Help is here.</span>
            </h1>

            {/* Empathetic Description */}
            <p className="text-base sm:text-lg text-[#52606D] max-w-2xl leading-relaxed">
              Sakhi One Stop Centres (OSCs) provide immediate, confidential support under one roof—safe shelter, medical treatment, legal aid, trauma counselling, and police facilitation. Free, 24/7, and without mandatory registration.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onGetHelpNow}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#3E5C54] hover:bg-[#2F453F] active:scale-[0.98] text-white text-base font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Get Help Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onFindNearbyOSC}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#F4F7F4] active:scale-[0.98] text-[#2F453F] border-2 border-[#A3B899] text-base font-bold shadow-xs transition-all"
              >
                <MapPin className="w-5 h-5 text-[#3E5C54]" />
                <span>Find Nearby OSCs</span>
              </button>
            </div>

            {/* Zero-Pill Reassurance Metadata */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs sm:text-sm font-medium text-slate-600 pt-3">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#3E5C54]" />
                <span>100% Confidential</span>
              </div>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#3E5C54]" />
                <span>Completely Free</span>
              </div>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3E5C54]" />
                <span>Guest Access Enabled</span>
              </div>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-[#3E5C54]" />
                <span>24/7 Response</span>
              </div>
            </div>
          </div>

          {/* Right Card / Support Highlight (Right 5 Cols) */}
          <div className="lg:col-span-5">
            <div className="relative bg-white rounded-3xl p-6 sm:p-7 border border-[#D0DDD0] shadow-xl space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Centre Network Active
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">700+ OSCs Pan-India</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  Immediate, Integrated Sanctuary Under One Roof
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You do not need to navigate separate hospitals, police stations, courts, and welfare offices alone. Sakhi One Stop Centres bring every essential service directly to you in a safe, trauma-informed environment.
                </p>
              </div>

              {/* Quick Pillars Overview */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-[#F4F7F4] border border-[#D0DDD0] text-left">
                  <div className="text-xs font-bold text-[#2F453F]">Safe Shelter</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Secure stay up to 5 days</div>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F7F4] border border-[#D0DDD0] text-left">
                  <div className="text-xs font-bold text-[#2F453F]">Medical Care</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Trauma, first aid & medico-legal</div>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F7F4] border border-[#D0DDD0] text-left">
                  <div className="text-xs font-bold text-[#2F453F]">Legal Aid</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Empanelled advocates</div>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F7F4] border border-[#D0DDD0] text-left">
                  <div className="text-xs font-bold text-[#2F453F]">Counselling</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Psychosocial recovery</div>
                </div>
              </div>

              {/* Quick Crisis Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">In physical danger right now?</span>
                <button
                  onClick={onEmergencyHelp}
                  className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors"
                >
                  Dial 112 Help
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
