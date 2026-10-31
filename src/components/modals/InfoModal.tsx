import React from 'react';
import { X, ShieldCheck, Info, HelpCircle, FileText, CheckCircle2, HeartHandshake, Eye, Lock } from 'lucide-react';
import { FAQS } from '../../data/mockData';

export type InfoModalType = 'about' | 'privacy' | 'faq' | 'accessibility';

interface Props {
  isOpen: boolean;
  type: InfoModalType;
  onClose: () => void;
}

export const InfoModal: React.FC<Props> = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (type) {
      case 'about':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-4 bg-[#F4F7F4] rounded-xl border border-[#D0DDD0] space-y-2">
              <h3 className="font-bold text-[#2F453F] text-sm sm:text-base flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#3E5C54]" />
                About Sakhi One Stop Centres (OSC)
              </h3>
              <p>
                The One Stop Centre (OSC) scheme, popularly known as <strong>Sakhi</strong>, was launched by the <strong>Ministry of Women and Child Development (MWCD), Government of India</strong>, under the Nirbhaya Fund framework.
              </p>
              <p>
                The scheme is designed to facilitate access to an integrated range of services including medical, legal, psychological, police, and temporary shelter support under a single roof to women affected by violence, both in private and public spaces.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Core Objectives of SakhiLink:</h4>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>Provide immediate emergency response and rescue services.</li>
                <li>Offer confidential medical treatment, trauma evaluation, and forensic documentation.</li>
                <li>Support lodging of FIR / NCR through Women Police Officers stationed at centres.</li>
                <li>Provide trauma-informed psycho-social counselling and mental wellness support.</li>
                <li>Connect victims to legal aid advocates through State and District Legal Services Authorities.</li>
                <li>Ensure temporary shelter of up to 5 days with food, hygiene supplies, and dignity.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <strong>All Services are 100% Free:</strong> No fee, charge, or registration payment is ever required at any official One Stop Centre.
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-4 bg-[#F4F7F4] rounded-xl border border-[#D0DDD0] space-y-2">
              <h3 className="font-bold text-[#2F453F] text-sm sm:text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#3E5C54]" />
                Victim Privacy & Data Governance Charter
              </h3>
              <p>
                SakhiLink was engineered specifically around the safety realities of vulnerable individuals, victims of domestic violence, harassment, or acute trauma.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3E5C54]" />
                  1. Zero Mandatory Registration & Guest Priority
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  You are never forced to create an account, verify an email, or submit an Aadhaar identity number to find shelter or request assistance.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3E5C54]" />
                  2. Consent-Based Geolocation Only
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  We never trigger automatic GPS location requests in the background. Location matching is strictly initiated when you select your district manually or tap to share.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3E5C54]" />
                  3. Encrypted & Role-Restricted Records
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Case details are accessible only by authorized One Stop Centre duty case workers and counsellors. We do not sell, monetize, or disclose victim records to any commercial 3rd party.
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Safety Disclaimer on Browser History:</strong> The Quick Exit button redirects your current screen immediately, but it cannot purge the device browser history. Always use Private/Incognito tabs if someone monitors your phone.
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-3 text-xs sm:text-sm text-slate-700">
            <p className="text-xs text-slate-500 mb-2">
              Common questions about accessing One Stop Centres, emergency shelter, and legal support:
            </p>
            {FAQS.map((faq, index) => (
              <div key={index} className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#D0DDD0] space-y-1">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {faq.question}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-4 bg-[#F4F7F4] rounded-xl border border-[#D0DDD0]">
              <h3 className="font-bold text-[#2F453F] text-sm sm:text-base">
                Accessibility Statement
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                SakhiLink is built to be accessible to all individuals across diverse abilities, devices, connection speeds, and literacy levels.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Key Accessibility Provisions:</h4>
              <ul className="space-y-1.5 list-disc pl-5 text-xs text-slate-600">
                <li>High contrast color pairings conforming with WCAG 2.1 AA standards.</li>
                <li>Minimum 44px by 44px tap targets for one-handed mobile and motor accessibility.</li>
                <li>Screen reader accessible aria-labels and semantic HTML structure.</li>
                <li>Quick Exit accessible via keyboard shortcut (ESC key or prominent red exit trigger).</li>
                <li>Clear multilingual display options for major Indian linguistic communities.</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  const titles: Record<InfoModalType, string> = {
    about: 'About SakhiLink & One Stop Centres',
    privacy: 'Privacy Policy & Data Security',
    faq: 'Help, Support & Frequently Asked Questions',
    accessibility: 'Accessibility & User Inclusivity'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D0DDD0] overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#F4F7F4] border-b border-[#D0DDD0]">
          <h2 className="text-base sm:text-lg font-bold text-[#1F2937]">
            {titles[type]}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {renderContent()}
        </div>

        <div className="px-5 sm:px-6 py-3 bg-[#FAF9F5] border-t border-[#D0DDD0] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-semibold transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
