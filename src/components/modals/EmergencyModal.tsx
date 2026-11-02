import React from 'react';
import { X, PhoneCall, AlertOctagon, ShieldCheck, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { EMERGENCY_NUMBERS } from '../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onQuickExit?: () => void;
}

export const EmergencyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-red-200 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Alert Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-lg sm:text-xl font-bold text-red-950">
                Immediate Emergency Assistance
              </h2>
              <p className="text-xs text-red-800">
                For active threats, acute crisis, or immediate danger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Statutory Disclaimer Card */}
          <div className="p-4 bg-red-50/60 rounded-xl border border-red-200/70 text-xs sm:text-sm text-red-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-red-950">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>Not An Emergency Dispatch Portal</span>
            </div>
            <p className="leading-relaxed">
              <strong>SakhiLink</strong> is an information and support coordination platform connecting you to One Stop Centres. We are <strong>not</strong> an immediate police/paramedic dispatch service. If you are experiencing an ongoing physical attack, medical emergency, or immediate threat, please <strong>dial 112</strong> or your local emergency line immediately.
            </p>
          </div>

          {/* Direct Emergency Call Strip */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Direct Emergency Helplines (24/7 Free Across India)
            </h3>

            {/* 112 Big Button */}
            <a
              href="tel:112"
              className="flex items-center justify-between p-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-md group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black tracking-wide flex items-center gap-2">
                    Dial 112
                    <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">
                      National All-in-One Emergency
                    </span>
                  </div>
                  <div className="text-xs text-red-100 font-normal">
                    Police, Ambulance, Fire · Toll-Free 24 Hours
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Other Official Helplines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EMERGENCY_NUMBERS.filter(n => n.number !== '112').map((item) => (
                <a
                  key={item.number}
                  href={`tel:${item.number}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-[#FAF9F5] hover:bg-[#F4F7F4] hover:border-[#3E5C54] transition-all group"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{item.number}</span>
                      <span className="text-xs font-normal text-slate-500">· {item.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{item.desc}</div>
                  </div>
                  <PhoneCall className="w-4 h-4 text-[#3E5C54] group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Immediate Safety Recommendations */}
          <div className="p-4 bg-[#F4F7F4] rounded-xl border border-[#D0DDD0] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2F453F] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#3E5C54]" />
              Crisis Safety Protocol
            </h4>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
              <li>Move to a populated room or area with an accessible exit. Avoid bathrooms or kitchens where objects could be used harmfully.</li>
              <li>Keep your phone charged and easily reachable.</li>
              <li>Have essential documents (ID, bank passbook, medicine) in a small discreet bag if you anticipate fleeing to a shelter.</li>
            </ul>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
