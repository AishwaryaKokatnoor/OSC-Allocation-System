import React, { useState } from 'react';
import { Shield, Globe, LogIn, ExternalLink, Menu, X, HeartHandshake, ChevronDown, Check } from 'lucide-react';
import { LANGUAGES } from '../data/mockData';
import { LanguageOption } from '../types';

interface HeaderProps {
  onOpenAuth: (tab?: 'beneficiary' | 'staff') => void;
  onQuickExit: () => void;
  selectedLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onQuickExit,
  selectedLanguage,
  onSelectLanguage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

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

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-3 sm:gap-4">
            {/* Functional Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-[#FAF9F5] hover:bg-[#F4F7F4] border border-[#D0DDD0] transition-colors"
                aria-expanded={langDropdownOpen}
                aria-haspopup="true"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#3E5C54]" />
                <span className="font-medium">{selectedLanguage.name}</span>
                <span className="text-[11px] text-slate-400 font-normal">({selectedLanguage.nativeName})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-[#D0DDD0] py-2 z-30 space-y-0.5">
                    <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Select Preferred Language
                    </div>
                    {LANGUAGES.map((lang) => {
                      const isSelected = selectedLanguage.code === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            onSelectLanguage(lang);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                            isSelected
                              ? 'bg-[#F4F7F4] font-semibold text-[#2F453F]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="font-medium">{lang.name}</span>
                            <span className="text-slate-500 ml-1.5 text-[11px]">({lang.nativeName})</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#3E5C54]" />}
                        </button>
                      );
                    })}
                    <div className="px-3 pt-2 pb-1 border-t border-slate-100 text-[10px] text-slate-500 leading-tight">
                      Selected language preference will adapt UI labels and helpline regions.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Login & Register Buttons */}
            <button
              onClick={() => onOpenAuth('staff')}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-[#3E5C54] hover:bg-[#F4F7F4] border border-transparent hover:border-[#D0DDD0] transition-colors"
            >
              Staff Portal
            </button>
            <button
              onClick={() => onOpenAuth('beneficiary')}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#F4F7F4] transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => onOpenAuth('beneficiary')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E6ECE5] text-[#2F453F] hover:bg-[#D0DDD0] border border-[#A3B899] transition-colors"
            >
              Register
            </button>

            {/* Quick Exit Button (High Priority Safety Feature) */}
            <div className="relative group">
              <button
                onClick={onQuickExit}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wide transition-all shadow-xs"
                title="Immediately navigates away to a neutral website (e.g. Google Search). Does not clear browser history."
                aria-label="Quick Exit website"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Quick Exit</span>
              </button>
              {/* Desktop Safety Tooltip */}
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg pointer-events-none z-50">
                Instantly leaves this website to a neutral page. <span className="text-amber-300 font-medium">Note: Does not erase browser history.</span>
              </div>
            </div>
          </div>

          {/* Mobile Actions: Quick Exit + Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onQuickExit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 active:bg-red-700 text-white font-bold text-xs shadow-xs"
              aria-label="Quick Exit website immediately"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Quick Exit</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#D0DDD0] space-y-3 bg-white">
            {/* Language Selector Mobile */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 px-1">
                Choose Language
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLanguage(lang);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#3E5C54] text-white border-[#3E5C54]'
                          : 'bg-[#FAF9F5] text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {lang.nativeName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auth Buttons Mobile */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onOpenAuth('beneficiary');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-semibold text-center hover:bg-slate-50"
              >
                Beneficiary Login
              </button>
              <button
                onClick={() => {
                  onOpenAuth('beneficiary');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#3E5C54] text-white text-xs font-semibold text-center hover:bg-[#2F453F]"
              >
                Register
              </button>
            </div>

            {/* Staff Portal Link */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onOpenAuth('staff');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 rounded-xl bg-[#F4F7F4] text-[#2F453F] text-xs font-semibold text-center hover:bg-[#E6ECE5] border border-[#D0DDD0]"
              >
                Authorized OSC Staff Portal Access
              </button>
            </div>

            {/* Mobile Exit note */}
            <div className="p-2.5 rounded-lg bg-red-50 text-[11px] text-red-900 border border-red-200 leading-tight">
              <strong>Quick Exit Reminder:</strong> Tapping Quick Exit leaves to Google immediately. It does not erase browser history.
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
