import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../data/mockData';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface HowItWorksProps {
  onGetHelpNow: () => void;
  onFindNearbyOSC: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onGetHelpNow, onFindNearbyOSC }) => {
  return (
    <section className="py-12 sm:py-16 bg-[#F4F7F4]/60 border-y border-[#D0DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#2F453F] text-xs font-bold uppercase tracking-wider border border-[#D0DDD0]">
            Simple, Safe & Dignified
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            How SakhiLink Works
          </h2>
          <p className="text-sm sm:text-base text-[#52606D] leading-relaxed">
            Designed for ease and security during distressing moments. Access assistance in three straightforward steps without paperwork friction.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="relative bg-white rounded-3xl p-6 sm:p-8 border border-[#D0DDD0] shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Step badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#3E5C54]">
                    {step.number}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Step {idx + 1} of 3
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Step footer cue */}
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-[#2F453F]">
                <CheckCircle2 className="w-4 h-4 text-[#3E5C54]" />
                <span>
                  {idx === 0 && 'No registration required'}
                  {idx === 1 && 'Verified capacity status'}
                  {idx === 2 && 'Confidential case handover'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-10 sm:mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-[#D0DDD0] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              Need immediate advice or guidance?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              You can start your request right now or speak to a dedicated female helpline coordinator.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onFindNearbyOSC}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Explore Centres
            </button>
            <button
              onClick={onGetHelpNow}
              className="px-5 py-2.5 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold transition-colors shadow-xs"
            >
              Get Help Now
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
