/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { EmergencyBanner } from './components/EmergencyBanner';
import { ServicesGrid } from './components/ServicesGrid';
import { HowItWorks } from './components/HowItWorks';
import { PrivacyTrust } from './components/PrivacyTrust';
import { Footer } from './components/Footer';

import { AssistanceRequestModal } from './components/modals/AssistanceRequestModal';
import { EmergencyModal } from './components/modals/EmergencyModal';
import { OSCDiscoveryModal } from './components/modals/OSCDiscoveryModal';
import { InfoModal, InfoModalType } from './components/modals/InfoModal';

import { ServiceType } from './types';
import { ShieldCheck, MessageSquare, Bell, Lock } from 'lucide-react';
import { OSCPortal } from './components/staff/OSCPortal';
import { StaffAuthGateway, StaffUserData } from './components/staff/StaffAuthGateway';

import { EmergencyAssistanceScreen } from './components/victim/EmergencyAssistanceScreen';
import { AssistanceRequestScreen } from './components/victim/AssistanceRequestScreen';
import { OSCDiscoveryScreen } from './components/victim/OSCDiscoveryScreen';
import { RecommendedSupportScreen } from './components/victim/RecommendedSupportScreen';
import { RequestTrackingScreen } from './components/victim/RequestTrackingScreen';
import { HelpCommunicationScreen } from './components/victim/HelpCommunicationScreen';
import { VictimNotificationsScreen } from './components/victim/VictimNotificationsScreen';
import { VictimPrivacySettingsScreen } from './components/victim/VictimPrivacySettingsScreen';

import { OSCDiscoveryCardItem } from './types/database';

export type AppViewMode =
  | 'victim-home'          // Screen 1
  | 'emergency-assistance' // Screen 2
  | 'assistance-request'   // Screen 3
  | 'osc-discovery'        // Screen 4
  | 'recommended-support'  // Screen 5
  | 'request-tracking'     // Screen 6
  | 'help-communication'   // Screen 7
  | 'victim-notifications' // Screen 8
  | 'victim-privacy'       // Screen 9
  | 'staff-portal';        // Module A

export default function App() {
  const [activeView, setActiveView] = useState<AppViewMode>('victim-home');
  const [currentUserRole, setCurrentUserRole] = useState<string>('OSC Centre Administrator');
  const [currentStaffUser, setCurrentStaffUser] = useState<StaffUserData | null>(null);
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(false);

  // Active Victim Request Session Context (saved in localStorage for recovery)
  const [activeRequestReference, setActiveRequestReference] = useState<string | undefined>(() => {
    return localStorage.getItem('sakhilink_request_ref') || undefined;
  });
  const [activeTrackingToken, setActiveTrackingToken] = useState<string | undefined>(() => {
    return localStorage.getItem('sakhilink_tracking_token') || undefined;
  });
  const [, setSelectedOSCCentre] = useState<OSCDiscoveryCardItem | null>(null);

  // Modal states
  const [assistanceModalOpen, setAssistanceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('shelter');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [oscDiscoveryModalOpen, setOscDiscoveryModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState<InfoModalType>('about');

  // Track reference helper
  const handleSaveActiveSession = (ref: string, token?: string) => {
    setActiveRequestReference(ref);
    localStorage.setItem('sakhilink_request_ref', ref);
    if (token) {
      setActiveTrackingToken(token);
      localStorage.setItem('sakhilink_tracking_token', token);
    }
  };

  const handleClearSession = () => {
    setActiveRequestReference(undefined);
    setActiveTrackingToken(undefined);
    localStorage.removeItem('sakhilink_request_ref');
    localStorage.removeItem('sakhilink_tracking_token');
    setActiveView('victim-home');
  };

  // Open Assistance Request Screen (Screen 3)
  const handleServiceCardClick = (serviceId: ServiceType) => {
    setSelectedService(serviceId);
    setActiveView('assistance-request');
  };

  // Open Info modals
  const handleOpenInfo = (type: InfoModalType) => {
    setInfoModalType(type);
    setInfoModalOpen(true);
  };

  /* ========================================================================
     ROUTING DISPATCHER: MODULE A & MODULE B
     ======================================================================== */

  // MODULE A: OSC Staff Portal
  if (activeView === 'staff-portal') {
    if (!isStaffAuthenticated) {
      return (
        <StaffAuthGateway
          onLoginSuccess={(user) => {
            setCurrentStaffUser(user);
            setCurrentUserRole(user.role);
            setIsStaffAuthenticated(true);
          }}
          onReturnToHome={() => setActiveView('victim-home')}
        />
      );
    }

    return (
      <OSCPortal
        onLogout={() => {
          setIsStaffAuthenticated(false);
          setCurrentStaffUser(null);
        }}
        currentUserRole={currentUserRole}
        currentStaffName={currentStaffUser?.name || 'Priya Sharma'}
      />
    );
  }

  // MODULE B: Screen 2 — Emergency Assistance
  if (activeView === 'emergency-assistance') {
    return (
      <EmergencyAssistanceScreen
        onBackToHome={() => setActiveView('victim-home')}
      />
    );
  }

  // MODULE B: Screen 3 — General Assistance Request Intake
  if (activeView === 'assistance-request') {
    return (
      <AssistanceRequestScreen
        initialService={selectedService as any}
        onBackToHome={() => setActiveView('victim-home')}
        onGoToEmergency={() => setActiveView('emergency-assistance')}
        onContinueToOSCDiscovery={(reqRef, token) => {
          if (reqRef) handleSaveActiveSession(reqRef, token);
          setActiveView('recommended-support');
        }}
      />
    );
  }

  // MODULE B: Screen 4 — Nearby OSC Discovery & Directory
  if (activeView === 'osc-discovery') {
    return (
      <OSCDiscoveryScreen
        initialRequestReference={activeRequestReference}
        initialTrackingToken={activeTrackingToken}
        onBackToAssistanceRequest={() => setActiveView('assistance-request')}
        onGoToEmergency={() => setActiveView('emergency-assistance')}
        onSelectCentre={(centre, reqRef) => {
          setSelectedOSCCentre(centre);
          if (reqRef) handleSaveActiveSession(reqRef, activeTrackingToken);
          setActiveView('recommended-support');
        }}
      />
    );
  }

  // MODULE B: Screen 5 — Recommended Support (Weighted Scoring & Referral Selection)
  if (activeView === 'recommended-support') {
    const refToUse = activeRequestReference || 'REQ-KA-001001';
    return (
      <RecommendedSupportScreen
        requestReference={refToUse}
        onBackToDiscovery={() => setActiveView('osc-discovery')}
        onConfirmReferral={(referral, reqRef) => {
          handleSaveActiveSession(reqRef);
          setActiveView('request-tracking');
        }}
        onGoToEmergency={() => setActiveView('emergency-assistance')}
      />
    );
  }

  // MODULE B: Screen 6 — Request Tracking (Timeline & Status)
  if (activeView === 'request-tracking') {
    const refToUse = activeRequestReference || 'REQ-KA-001001';
    return (
      <RequestTrackingScreen
        requestReference={refToUse}
        trackingToken={activeTrackingToken}
        onBackToHome={() => setActiveView('victim-home')}
        onOpenMessaging={(ref) => {
          handleSaveActiveSession(ref);
          setActiveView('help-communication');
        }}
        onGoToEmergency={() => setActiveView('emergency-assistance')}
      />
    );
  }

  // MODULE B: Screen 7 — Help & Communication (In-App Messaging & Callback Requests)
  if (activeView === 'help-communication') {
    const refToUse = activeRequestReference || 'REQ-KA-001001';
    return (
      <HelpCommunicationScreen
        requestReference={refToUse}
        onBackToTracking={() => setActiveView('request-tracking')}
        onGoToEmergency={() => setActiveView('emergency-assistance')}
      />
    );
  }

  // MODULE B: Screen 8 — Victim Notifications
  if (activeView === 'victim-notifications') {
    const refToUse = activeRequestReference || 'REQ-KA-001001';
    return (
      <VictimNotificationsScreen
        requestReference={refToUse}
        onBackToHome={() => setActiveView('victim-home')}
        onOpenTracking={(ref) => {
          handleSaveActiveSession(ref);
          setActiveView('request-tracking');
        }}
        onGoToEmergency={() => setActiveView('emergency-assistance')}
      />
    );
  }

  // MODULE B: Screen 9 — Profile, Privacy & Data Deletion Settings
  if (activeView === 'victim-privacy') {
    return (
      <VictimPrivacySettingsScreen
        requestReference={activeRequestReference}
        onBackToHome={() => setActiveView('victim-home')}
        onTerminateSession={handleClearSession}
        onGoToEmergency={() => setActiveView('emergency-assistance')}
      />
    );
  }

  // MODULE B: Screen 1 — Home / Welcome Landing
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#1F2937] text-base selection:bg-[#E6ECE5] selection:text-[#2F453F]">
      
      {/* 1. Header: Logo, tagline, and Staff Portal button only */}
      <Header
        onOpenStaffPortal={() => setActiveView('staff-portal')}
      />

      {/* Active Session Sub-Bar if an assistance request was initiated */}
      {activeRequestReference && (
        <div className="bg-[#2F453F] text-white px-4 py-2 border-b border-[#3E5C54]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Active Assistance Session: <strong className="font-mono">{activeRequestReference}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('request-tracking')}
                className="hover:text-emerald-200 underline font-semibold flex items-center gap-1"
              >
                <span>Track Status (Screen 6)</span>
              </button>
              <span>·</span>
              <button
                onClick={() => setActiveView('help-communication')}
                className="hover:text-emerald-200 underline font-semibold flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Desk (Screen 7)</span>
              </button>
              <span>·</span>
              <button
                onClick={() => setActiveView('victim-notifications')}
                className="hover:text-emerald-200 underline font-semibold flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notifications (Screen 8)</span>
              </button>
              <span>·</span>
              <button
                onClick={() => setActiveView('victim-privacy')}
                className="hover:text-emerald-200 underline font-semibold flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Privacy Rights (Screen 9)</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* 7. Footer: About, Privacy Policy, Emergency Contacts */}
      <Footer
        onOpenInfo={handleOpenInfo}
        onOpenEmergency={() => setActiveView('emergency-assistance')}
      />

      {/* Interactive Modals */}
      <AssistanceRequestModal
        isOpen={assistanceModalOpen}
        onClose={() => setAssistanceModalOpen(false)}
        initialService={selectedService}
      />

      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />

      <OSCDiscoveryModal
        isOpen={oscDiscoveryModalOpen}
        onClose={() => setOscDiscoveryModalOpen(false)}
        onSelectCentreForRequest={() => {
          setSelectedService('shelter');
          setActiveView('assistance-request');
        }}
      />

      <InfoModal
        isOpen={infoModalOpen}
        type={infoModalType}
        onClose={() => setInfoModalOpen(false)}
      />

    </div>
  );
}
