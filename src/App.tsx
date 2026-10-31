/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { EmergencyBanner } from './components/EmergencyBanner';
import { ServicesGrid } from './components/ServicesGrid';
import { HowItWorks } from './components/HowItWorks';
import { PrivacyTrust } from './components/PrivacyTrust';
import { Footer } from './components/Footer';
import { QuickExitBar } from './components/QuickExitBar';

import { AssistanceRequestModal } from './components/modals/AssistanceRequestModal';
import { EmergencyModal } from './components/modals/EmergencyModal';
import { OSCDiscoveryModal } from './components/modals/OSCDiscoveryModal';
import { AuthModal } from './components/modals/AuthModal';
import { InfoModal, InfoModalType } from './components/modals/InfoModal';

import { ServiceType, LanguageOption } from './types';
import { LANGUAGES } from './data/mockData';
import { CloudSun, ArrowLeft, Shield, ShieldCheck } from 'lucide-react';
import { OSCPortal } from './components/staff/OSCPortal';
import { EmergencyAssistanceScreen } from './components/victim/EmergencyAssistanceScreen';
import { AssistanceRequestScreen } from './components/victim/AssistanceRequestScreen';
import { OSCDiscoveryScreen } from './components/victim/OSCDiscoveryScreen';
import { OSCDiscoveryCardItem } from './types/database';

export default function App() {
  // Navigation view mode: 'victim-home' (Screen 1), 'emergency-assistance' (Screen 2), 'assistance-request' (Screen 3), 'osc-discovery' (Screen 4), or 'staff-portal'
  const [activeView, setActiveView] = useState<'victim-home' | 'emergency-assistance' | 'assistance-request' | 'osc-discovery' | 'staff-portal'>('victim-home');
  const [currentUserRole, setCurrentUserRole] = useState<string>('OSC Centre Administrator');

  // Request & Discovery Context
  const [activeRequestReference, setActiveRequestReference] = useState<string | undefined>(undefined);
  const [activeTrackingToken, setActiveTrackingToken] = useState<string | undefined>(undefined);
  const [selectedOSCCentre, setSelectedOSCCentre] = useState<OSCDiscoveryCardItem | null>(null);
  const [centreSelectionToast, setCentreSelectionToast] = useState<string | null>(null);

  // Modal states
  const [assistanceModalOpen, setAssistanceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('shelter');

  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [oscDiscoveryModalOpen, setOscDiscoveryModalOpen] = useState(false);
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'beneficiary' | 'staff'>('beneficiary');

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<InfoModalType>('about');

  // Accessibility & Preferences
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Neutral Screen fail-safe (for Quick Exit if iframe sandbox intercepts external redirects)
  const [isNeutralScreen, setIsNeutralScreen] = useState(false);

  // Quick exit handler
  const handleQuickExit = () => {
    // Attempt redirect to neutral public site
    try {
      window.location.replace('https://www.google.com');
    } catch {
      window.location.href = 'https://www.google.com';
    }
    // Instant in-app neutral disguise screen
    setIsNeutralScreen(true);
  };

  const handleStaffLoginSuccess = (staffInfo: { name: string; role: string; centre: string }) => {
    setCurrentUserRole(staffInfo.role);
    setAuthModalOpen(false);
    setActiveView('staff-portal');
  };

  // Open Assistance Request Screen (Screen 3) with a prefilled service
  const handleServiceCardClick = (serviceId: ServiceType) => {
    setSelectedService(serviceId);
    setActiveView('assistance-request');
  };

  // Open Auth modal with specific tab
  const handleOpenAuth = (tab: 'beneficiary' | 'staff' = 'beneficiary') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  // Open Info modals (About, Privacy, FAQ, Accessibility)
  const handleOpenInfo = (type: InfoModalType) => {
    setInfoModalType(type);
    setInfoModalOpen(true);
  };

  // Font size class mapping
  const fontSizeClass = {
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  }[fontSize];

  // If neutral screen is triggered by Quick Exit
  if (isNeutralScreen) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-6 flex flex-col justify-between font-sans">
        <div className="max-w-2xl mx-auto w-full pt-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-xl">
              <CloudSun className="w-8 h-8" />
              <span>National Weather & Regional Meteorological Service</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Current Weather</span>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-slate-900">26°C</div>
                <div className="text-sm text-slate-500">Partly Cloudy · Humidity 58%</div>
              </div>
              <CloudSun className="w-16 h-16 text-amber-400" />
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              7-Day regional outlook indicates steady seasonal temperatures across major metropolitan regions.
            </p>
          </div>

          <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-500">
            This neutral page was opened via <strong>Quick Exit</strong> to protect your immediate privacy.
          </div>

          <div>
            <button
              onClick={() => setIsNeutralScreen(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to SakhiLink</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If OSC Staff Portal is active
  if (activeView === 'staff-portal') {
    return (
      <OSCPortal
        onLogout={() => setActiveView('victim-home')}
        onReturnToVictimHome={() => setActiveView('victim-home')}
        currentUserRole={currentUserRole}
      />
    );
  }

  // If Screen 2: Emergency Assistance is active
  if (activeView === 'emergency-assistance') {
    return (
      <EmergencyAssistanceScreen
        onBackToHome={() => setActiveView('victim-home')}
        onQuickExit={handleQuickExit}
      />
    );
  }

  // If Screen 3: Assistance Request is active
  if (activeView === 'assistance-request') {
    return (
      <AssistanceRequestScreen
        initialService={selectedService as any}
        onBackToHome={() => setActiveView('victim-home')}
        onQuickExit={handleQuickExit}
        onGoToEmergency={() => setActiveView('emergency-assistance')}
        onContinueToOSCDiscovery={(reqRef, token) => {
          setActiveRequestReference(reqRef);
          setActiveTrackingToken(token);
          setActiveView('osc-discovery');
        }}
      />
    );
  }

  // If Screen 4: Nearby OSC Discovery is active
  if (activeView === 'osc-discovery') {
    return (
      <>
        {centreSelectionToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2F453F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs border border-emerald-400 animate-in fade-in slide-in-from-top-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{centreSelectionToast}</span>
            <button
              onClick={() => setCentreSelectionToast(null)}
              className="ml-2 text-slate-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}
        <OSCDiscoveryScreen
          initialRequestReference={activeRequestReference}
          initialTrackingToken={activeTrackingToken}
          onBackToAssistanceRequest={() => setActiveView('assistance-request')}
          onQuickExit={handleQuickExit}
          onGoToEmergency={() => setActiveView('emergency-assistance')}
          onSelectCentre={(centre, reqRef) => {
            setSelectedOSCCentre(centre);
            const msg = `Selected ${centre.name} (${centre.centreCode})${reqRef ? ` for Request ${reqRef}` : ''}. Reference saved for Screen 5.`;
            setCentreSelectionToast(msg);
            setTimeout(() => setCentreSelectionToast(null), 5000);
          }}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#FAF9F5] text-[#1F2937] ${fontSizeClass} selection:bg-[#E6ECE5] selection:text-[#2F453F]`}>
      
      {/* 1. Header: Logo, tagline, language selector, Login, Register, Quick Exit */}
      <Header
        onOpenAuth={handleOpenAuth}
        onQuickExit={handleQuickExit}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
      />

      <main className="flex-grow">
        {/* 2. Hero: "You are not alone. Help is here.", description, Get Help Now, Find Nearby OSCs */}
        <Hero
          onGetHelpNow={() => {
            setSelectedService('shelter');
            setActiveView('assistance-request');
          }}
          onFindNearbyOSC={() => setActiveView('osc-discovery')}
          onEmergencyHelp={() => setActiveView('emergency-assistance')}
        />

        {/* 3. Emergency Assistance: Prominent help card & India 112 option */}
        <EmergencyBanner
          onOpenEmergencyModal={() => setActiveView('emergency-assistance')}
          onQuickExit={handleQuickExit}
        />

        {/* 4. Services: Safe Shelter, Medical, Legal, Counselling, Police, Other Support */}
        <ServicesGrid
          onSelectService={handleServiceCardClick}
        />

        {/* 5. How It Works: Tell us what you need, Find suitable OSCs, Get connected */}
        <HowItWorks
          onGetHelpNow={() => {
            setSelectedService('shelter');
            setActiveView('assistance-request');
          }}
          onFindNearbyOSC={() => setActiveView('osc-discovery')}
        />

        {/* 6. Privacy & Trust: Guest access, Optional personal info, Consent-based location, Authorized access */}
        <PrivacyTrust
          onOpenPrivacyPolicy={() => handleOpenInfo('privacy')}
        />
      </main>

      {/* 7. Footer: About, Privacy Policy, Help and Support, Emergency Contacts, Accessibility */}
      <Footer
        onOpenInfo={handleOpenInfo}
        onOpenEmergency={() => setActiveView('emergency-assistance')}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
      />

      {/* Persistent floating Quick Exit bar (optimized for mobile thumb zone) */}
      <QuickExitBar onQuickExit={handleQuickExit} />

      {/* Interactive Modals */}
      
      {/* Assistance Request Modal (Opens with prefilled service from service cards or Get Help Now) */}
      <AssistanceRequestModal
        isOpen={assistanceModalOpen}
        onClose={() => setAssistanceModalOpen(false)}
        initialService={selectedService}
      />

      {/* Emergency Assistance Modal (India 112, 181, 1091, crisis protocols) */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        onQuickExit={handleQuickExit}
      />

      {/* OSC Discovery Modal (Find nearby centres with district filter and consent-based location) */}
      <OSCDiscoveryModal
        isOpen={oscDiscoveryModalOpen}
        onClose={() => setOscDiscoveryModalOpen(false)}
        onSelectCentreForRequest={(centreName) => {
          setSelectedService('shelter');
          setAssistanceModalOpen(true);
        }}
      />

      {/* Login & Register Modal (Beneficiary Phone/OTP & Guest Access + OSC Staff Module Authentication) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
        onGuestContinue={() => {
          // Guest continue allows frictionless browsing
        }}
        onStaffLoginSuccess={handleStaffLoginSuccess}
      />

      {/* Information Modal (About OSC, Privacy Policy, FAQ, Accessibility) */}
      <InfoModal
        isOpen={infoModalOpen}
        type={infoModalType}
        onClose={() => setInfoModalOpen(false)}
      />

    </div>
  );
}
