import React from 'react';
import { UserCheck, EyeOff, MapPinOff, Lock, Shield, CheckCircle, LucideIcon } from 'lucide-react';
import { PRIVACY_PILLARS } from '../data/mockData';

interface PrivacyTrustProps {
  onOpenPrivacyPolicy: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  UserCheck,
  EyeOff,
  MapPinOff,
  Lock
};

export const PrivacyTrust: React.FC<PrivacyTrustProps> = ({ onOpenPrivacyPolicy }) => {
  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6ECE5] text-[#2F453F] text-xs font-bold uppercase tracking-wider">
            Your Safety & Privacy Come First
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            Privacy and Trust Principles
          </h2>
          <p className="text-sm sm:text-base text-[#52606D] leading-relaxed">
            We understand the acute privacy risks faced by survivors. SakhiLink enforces strict technical and ethical boundaries so you can seek support without fear of surveillance or exposure.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRIVACY_PILLARS.map((pillar) => {
            const Icon = iconMap[pillar.icon] || Shield;

            return (
              <div
                key={pillar.id}
                className="bg-white rounded-3xl p-6 border border-[#D0DDD0] hover:border-[#3E5C54] shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F7F4] text-[#3E5C54] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#2F453F]">
                  <CheckCircle className="w-4 h-4 text-[#3E5C54]" />
                  <span>Verified Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Privacy Assurance callout */}
        <div className="mt-8 p-5 rounded-2xl bg-[#F4F7F4] border border-[#D0DDD0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3E5C54] text-white flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-left text-xs sm:text-sm text-slate-700">
              <span className="font-bold text-slate-900">Zero Data Sale or Commercial Profiling:</span>
              <p className="text-xs text-slate-600">
                SakhiLink is a public service utility under the Government of India. No tracking cookies or commercial ad trackers are deployed.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPrivacyPolicy}
            className="shrink-0 px-4 py-2 rounded-xl border border-[#3E5C54] text-[#2F453F] hover:bg-white text-xs font-bold transition-colors"
          >
            Read Privacy Charter
          </button>
        </div>

      </div>
    </section>
  );
};
