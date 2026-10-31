import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Home,
  Stethoscope,
  Scale,
  HeartHandshake,
  HandHeart,
  MapPin,
  Navigation,
  Lock,
  Phone,
  MessageSquare,
  Check,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  Accessibility
} from 'lucide-react';
import { AssistanceServiceCategory } from '../../types/database';
import { LANGUAGES } from '../../data/mockData';
import { apiClient } from '../../services/api';

interface Props {
  initialService?: AssistanceServiceCategory;
  onBackToHome: () => void;
  onQuickExit: () => void;
  onGoToEmergency: () => void;
  onContinueToOSCDiscovery: (requestReference?: string, trackingToken?: string) => void;
}

interface ServiceCardItem {
  id: AssistanceServiceCategory;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SERVICE_ITEMS: ServiceCardItem[] = [
  {
    id: 'shelter',
    title: 'Safe Shelter',
    desc: 'Immediate temporary secure accommodation with clean bedding, food, and round-the-clock female security.',
    icon: Home
  },
  {
    id: 'medical',
    title: 'Medical Assistance',
    desc: 'First aid, hospital coordination, medical examination, and confidential forensic support.',
    icon: Stethoscope
  },
  {
    id: 'legal',
    title: 'Legal Assistance',
    desc: 'Free legal aid, counsel from empanelled advocates, protection order applications, and court support.',
    icon: Scale
  },
  {
    id: 'counselling',
    title: 'Counselling',
    desc: 'Confidential psychosocial counselling, emotional healing, trauma recovery, and safety planning.',
    icon: HeartHandshake
  },
  {
    id: 'police',
    title: 'Police Assistance',
    desc: 'Direct liaison with female police officers at the centre, Zero FIR registration, and safety enforcement.',
    icon: ShieldAlert
  },
  {
    id: 'other',
    title: 'Other Support',
    desc: 'Long-term rehabilitation linkages, government welfare schemes, and vocational training support.',
    icon: HandHeart
  }
];

const ACCESSIBILITY_OPTIONS = [
  { id: 'wheelchair', label: 'Wheelchair / Physical Mobility Access' },
  { id: 'infant_care', label: 'Infant / Accompanying Child Care' },
  { id: 'hearing_sign', label: 'Sign Language / Hearing Assistance' },
  { id: 'elderly_care', label: 'Elderly / Senior Citizen Support' },
  { id: 'medical_storage', label: 'Medication Refrigeration Needed' }
];

export const AssistanceRequestScreen: React.FC<Props> = ({
  initialService = 'shelter',
  onBackToHome,
  onQuickExit,
  onGoToEmergency,
  onContinueToOSCDiscovery
}) => {
  // Step navigation (Form vs Review Summary vs Success)
  const [currentStep, setCurrentStep] = useState<'form' | 'review' | 'success'>('form');

  // 1. Assistance selection (Multiple allowed)
  const [selectedServices, setSelectedServices] = useState<AssistanceServiceCategory[]>([initialService]);

  // 2. Situation description (Optional, max 500 chars)
  const [description, setDescription] = useState('');
  const MAX_DESC_CHARS = 500;

  // 3. Location details
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [approxCoordinates, setApproxCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // 4. Additional preferences
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [preferredContactMethod, setPreferredContactMethod] = useState<'in_app' | 'phone' | 'sms' | 'no_direct_contact'>('in_app');
  const [contactNumber, setContactNumber] = useState('');
  const [safeToCall, setSafeToCall] = useState(true);
  const [safeToMessage, setSafeToMessage] = useState(true);
  const [safeTimeWindow, setSafeTimeWindow] = useState('Anytime safely');

  // Identity / Access Type
  const [accessType, setAccessType] = useState<'guest' | 'registered'>('guest');

  // Submission & API state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<any | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [idempotencyKey] = useState<string>(() => 'gen_idemp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    if (initialService && !selectedServices.includes(initialService)) {
      setSelectedServices([initialService]);
    }
  }, [initialService]);

  // Toggle service selection
  const handleToggleService = (srvId: AssistanceServiceCategory) => {
    if (selectedServices.includes(srvId)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter(s => s !== srvId));
      }
    } else {
      setSelectedServices([...selectedServices, srvId]);
    }
  };

  // Toggle accessibility option
  const handleToggleAccessibility = (optionId: string) => {
    if (accessibilityNeeds.includes(optionId)) {
      setAccessibilityNeeds(accessibilityNeeds.filter(id => id !== optionId));
    } else {
      setAccessibilityNeeds([...accessibilityNeeds, optionId]);
    }
  };

  // Explicit GPS action
  const handleRequestGPS = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser. Please select your district manually.');
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const approxLat = Math.round(pos.coords.latitude * 100) / 100;
        const approxLng = Math.round(pos.coords.longitude * 100) / 100;
        setApproxCoordinates({ lat: approxLat, lng: approxLng });
        setConsentGiven(true);
        setLocationNotice('Approximate location captured with your consent. Exact address coordinates are never stored.');
      },
      (err) => {
        setIsLocating(false);
        setConsentGiven(false);
        setLocationNotice(`Location access was declined (${err.message}). You can comfortably proceed with manual district selection.`);
      },
      { timeout: 8000 }
    );
  };

  // Validation before going to review step
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedServices.length === 0) {
      setErrorMessage('Please select at least one assistance service.');
      return;
    }

    if (
      (preferredContactMethod === 'phone' || preferredContactMethod === 'sms') &&
      (!contactNumber || contactNumber.trim().length < 10)
    ) {
      setErrorMessage('A valid 10-digit contact number is required when phone or SMS contact is selected.');
      return;
    }

    setCurrentStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submission to POST /api/victim/requests
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        idempotencyKey,
        requestType: 'general',
        accessType,
        services: selectedServices,
        description: description.trim(),
        location: {
          state,
          district,
          city: city.trim(),
          locality: locality.trim(),
          consentGiven,
          approxCoordinates: consentGiven && approxCoordinates ? approxCoordinates : undefined
        },
        preferences: {
          preferredLanguage,
          accessibilityNeeds,
          preferredContactMethod,
          contactNumber: (preferredContactMethod === 'phone' || preferredContactMethod === 'sms') ? contactNumber.trim() : undefined,
          safeToCall,
          safeToMessage,
          safeTimeWindow
        }
      };

      const result = await apiClient.submitGeneralRequest(payload);
      setSuccessResponse(result);
      setCurrentStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to submit request. Please check your internet connection or try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (successResponse?.requestReference) {
      const textToCopy = `Request: ${successResponse.requestReference}\nTracking Token: ${successResponse.trackingToken}`;
      navigator.clipboard.writeText(textToCopy);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1F2937] font-sans pb-16">
      
      {/* 2. PAGE HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D0DDD0] shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Back to Home */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#F4F7F4] border border-transparent hover:border-[#D0DDD0] transition-colors"
            aria-label="Back to SakhiLink Home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>

          {/* Title and Subtitle */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-sm sm:text-base font-extrabold text-[#1F2937] tracking-tight">
              Request Assistance
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#52606D] truncate max-w-[220px] sm:max-w-none">
              Tell us what support you need. You can share only what feels safe.
            </p>
          </div>

          {/* Quick Exit */}
          <div className="relative group">
            <button
              onClick={onQuickExit}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
              title="Immediately leaves to a neutral website. Note: Does not erase browser history."
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Quick Exit</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg pointer-events-none z-50">
              Instantly leaves to a neutral page. <span className="text-amber-300">Does not erase browser history.</span>
            </div>
          </div>

        </div>

        {/* Emergency Callout Strip */}
        <div className="bg-red-50 border-t border-b border-red-200/80 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-red-950">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>
                In immediate physical danger? Call India <strong>112</strong> directly or switch to crisis response.
              </span>
            </div>
            <button
              onClick={onGoToEmergency}
              className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1"
            >
              <span>Emergency Screen</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ========================================================= */}
        {/* STEP 3: SUCCESS CONFIRMATION */}
        {/* ========================================================= */}
        {currentStep === 'success' && successResponse ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-xl space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Assistance Request Registered
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Your Request Has Been Received Confidentially
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Trained female case coordinators at <strong>{successResponse.matchedOsc?.name}</strong> have been notified to review your needs.
              </p>
            </div>

            {/* Request Reference & Secret Tracking Token Card */}
            <div className="p-5 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between border-b border-[#D0DDD0]/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Case Reference Code
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs text-[#3E5C54] hover:underline font-semibold"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Copied Codes' : 'Copy Reference'}</span>
                </button>
              </div>

              <div>
                <div className="text-xs text-slate-500">Public Request ID:</div>
                <div className="text-2xl font-mono font-extrabold text-[#2F453F] tracking-wider select-all">
                  {successResponse.requestReference}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Secret Tracking Token:</div>
                <div className="text-sm font-mono font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 select-all">
                  {successResponse.trackingToken}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Keep this token safe. It is required to view your case updates without creating an account.
                </p>
              </div>
            </div>

            {/* Operational Reassurance & Safety Protocol */}
            <div className="p-4 bg-[#F4F7F4] rounded-2xl border border-[#D0DDD0] text-left text-xs text-slate-700 space-y-2">
              <div className="font-bold text-[#2F453F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3E5C54]" />
                <span>Next Operational Steps</span>
              </div>
              <p>
                • <strong>Contact Timing:</strong> Coordinators will observe your preference (<strong>{preferredContactMethod.replace('_', ' ').toUpperCase()}</strong>) within your requested time window (<strong>{safeTimeWindow}</strong>).
              </p>
              <p>
                • <strong>Direct OSC Walk-in:</strong> If you prefer in-person sanctuary, you can present this Reference Code at the One Stop Centre reception.
              </p>
              <p>
                • <strong>Shelter Note:</strong> Bed reservations and admission intake occur upon case coordinator verification.
              </p>
            </div>

            {/* 9. Navigation to Screen 4 (Nearby OSC Discovery) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onContinueToOSCDiscovery(successResponse?.requestReference, successResponse?.trackingToken)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue to Find Nearby OSCs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Return to SakhiLink Home
              </button>
            </div>
          </div>
        ) : currentStep === 'review' ? (
          /* ========================================================= */
          /* STEP 2: REVIEW AND SUMMARY BEFORE SUBMISSION */
          /* ========================================================= */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D0DDD0] shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-[#3E5C54] uppercase tracking-wider">Step 2 of 2 · Review Summary</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Review Your Assistance Request
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Please verify that your safe contact preferences and requested services are accurate before submitting.
              </p>
            </div>

            {/* Summary Highlights */}
            <div className="space-y-4 text-xs">
              
              {/* Requested Services */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] space-y-2">
                <div className="font-bold text-slate-900 text-sm">Selected Assistance Provisions</div>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map(srvId => {
                    const srv = SERVICE_ITEMS.find(s => s.id === srvId);
                    return (
                      <span key={srvId} className="px-3 py-1 bg-white text-[#2F453F] border border-[#A3B899] rounded-xl font-semibold shadow-2xs">
                        {srv ? srv.title : srvId}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Location Sharing */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] space-y-1">
                <div className="font-bold text-slate-900 text-sm">Location Context</div>
                <p className="text-slate-700">
                  Region: <strong>{district}, {state}</strong> {city ? `(${city})` : ''}
                </p>
                <p className="text-slate-500">
                  GPS Sharing: {consentGiven ? 'Shared approximately with your explicit consent' : 'No GPS coordinates shared'}
                </p>
              </div>

              {/* Safe Contact & Preferences */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] space-y-2">
                <div className="font-bold text-slate-900 text-sm">Safe Communication Preferences</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div>
                    Method: <strong className="capitalize">{preferredContactMethod.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    Language: <strong>{preferredLanguage}</strong>
                  </div>
                  {preferredContactMethod !== 'no_direct_contact' && preferredContactMethod !== 'in_app' && (
                    <>
                      <div>
                        Contact Number: <strong className="font-mono">{contactNumber}</strong>
                      </div>
                      <div>
                        Safe Time Window: <strong>{safeTimeWindow}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Accessibility */}
              {accessibilityNeeds.length > 0 && (
                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] space-y-1">
                  <div className="font-bold text-slate-900 text-sm">Accessibility Support Requirements</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {accessibilityNeeds.map(needId => {
                      const item = ACCESSIBILITY_OPTIONS.find(o => o.id === needId);
                      return (
                        <span key={needId} className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700">
                          {item ? item.label : needId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description preview */}
              {description && (
                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] space-y-1">
                  <div className="font-bold text-slate-900 text-sm">Situation Details (Optional)</div>
                  <p className="text-slate-700 italic">"{description}"</p>
                </div>
              )}

            </div>

            {/* Privacy Consent Statement */}
            <div className="p-4 bg-[#F4F7F4] rounded-2xl border border-[#D0DDD0] text-xs text-[#2F453F] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#3E5C54]" />
                <span>Privacy & Consent Statement</span>
              </div>
              <p className="leading-relaxed">
                By submitting, you authorize certified One Stop Centre coordinators under the Ministry of Women & Child Development to review your assistance request. Your identity and contact information are protected under government confidentiality protocols, never exposed publicly, and never sold to third parties.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('form')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Assistance Request...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Submit Assistance Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* STEP 1: ASSISTANCE REQUEST FORM */
          /* ========================================================= */
          <form onSubmit={handleProceedToReview} className="space-y-8">

            {/* 3. ASSISTANCE SELECTION */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D0DDD0] shadow-xs space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#3E5C54] text-white text-xs flex items-center justify-center font-bold">1</span>
                    <span>Select Support Needed</span>
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">Multiple selections allowed</span>
                </div>
                <p className="text-xs text-slate-600">
                  Select all services you would like the One Stop Centre to prepare for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SERVICE_ITEMS.map((service) => {
                  const isSelected = selectedServices.includes(service.id);
                  const Icon = service.icon;

                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => handleToggleService(service.id)}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#E6ECE5] border-[#3E5C54] text-[#2F453F] ring-1 ring-[#3E5C54] shadow-xs'
                          : 'bg-white hover:bg-[#FAF9F5] border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-[#3E5C54] text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-[#3E5C54] border-[#3E5C54] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-sm text-slate-900">{service.title}</div>
                          <p className="text-xs text-slate-600 mt-1 leading-snug">{service.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 4. SITUATION DESCRIPTION */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D0DDD0] shadow-xs space-y-3">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#3E5C54] text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Situation Description (Optional)</span>
                </h2>
                <p className="text-xs text-slate-600">
                  Briefly describe what kind of help you need. You are never forced to disclose sensitive incident details or upload documents.
                </p>
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={MAX_DESC_CHARS}
                  placeholder="Briefly describe what kind of help you need."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54] leading-relaxed resize-none"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
                  <span>Share only what you feel completely comfortable writing.</span>
                  <span>{MAX_DESC_CHARS - description.length} characters left</span>
                </div>
              </div>
            </section>

            {/* 5. LOCATION DETAILS */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D0DDD0] shadow-xs space-y-4">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#3E5C54] text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Location Details (Optional)</span>
                </h2>
                <p className="text-xs text-slate-600">
                  Helps identify the most suitable One Stop Centre in your district. You can submit without sharing location coordinates.
                </p>
              </div>

              {/* Explicit GPS Trigger */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRequestGPS}
                  disabled={isLocating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    consentGiven
                      ? 'bg-[#E6ECE5] text-[#2F453F] border border-[#3E5C54]'
                      : 'bg-[#FAF9F5] text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5 text-[#3E5C54]" />
                  <span>{isLocating ? 'Capturing approximate area...' : consentGiven ? 'Location Consent Granted' : 'Use My Current Location'}</span>
                </button>

                <span className="text-xs text-slate-400">
                  (Explicit permission required · Rounded to ~1.1km)
                </span>
              </div>

              {locationNotice && (
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>{locationNotice}</span>
                </div>
              )}

              {/* Manual Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Union Territory
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Telangana">Telangana</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                  >
                    <option value="Bengaluru Urban">Bengaluru Urban</option>
                    <option value="Central Delhi">Central Delhi</option>
                    <option value="Mumbai Suburban">Mumbai Suburban</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Other District">Other Region</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Locality (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shivajinagar"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                  />
                </div>
              </div>
            </section>

            {/* 6. ADDITIONAL PREFERENCES */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D0DDD0] shadow-xs space-y-5">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#3E5C54] text-white text-xs flex items-center justify-center font-bold">4</span>
                  <span>Communication & Accessibility Preferences</span>
                </h2>
                <p className="text-xs text-slate-600">
                  We respect your preferences in all case updates. We will never send unsolicited messages or make unsafe phone calls.
                </p>
              </div>

              {/* Preferred Language & Identity Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Language for Coordination
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.name}>
                        {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Submission Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAccessType('guest')}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        accessType === 'guest'
                          ? 'bg-[#3E5C54] text-white border-[#3E5C54]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Guest (No Account Needed)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccessType('registered')}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        accessType === 'registered'
                          ? 'bg-[#3E5C54] text-white border-[#3E5C54]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Registered Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Preferred Contact Method */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'in_app', label: 'In-App Tracking', desc: 'Private code only' },
                    { id: 'phone', label: 'Phone Call', desc: 'During safe hours' },
                    { id: 'sms', label: 'SMS Only', desc: 'Discreet text message' },
                    { id: 'no_direct_contact', label: 'No Direct Contact', desc: 'Walk-in only at OSC' }
                  ].map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setPreferredContactMethod(method.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        preferredContactMethod === method.id
                          ? 'bg-[#E6ECE5] border-[#3E5C54] text-[#2F453F] ring-1 ring-[#3E5C54]'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{method.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{method.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Phone / Contact Input */}
              {(preferredContactMethod === 'phone' || preferredContactMethod === 'sms') && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Safe Contact Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Safe Time Window
                      </label>
                      <select
                        value={safeTimeWindow}
                        onChange={(e) => setSafeTimeWindow(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                      >
                        <option value="Anytime safely">Anytime safely</option>
                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                        <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                        <option value="Evening (3 PM - 7 PM)">Evening (3 PM - 7 PM)</option>
                        <option value="Night (7 PM - 10 PM)">Night (7 PM - 10 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Safety confirmations */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={safeToCall}
                        onChange={(e) => setSafeToCall(e.target.checked)}
                        className="w-4 h-4 rounded text-[#3E5C54] focus:ring-[#3E5C54]"
                      />
                      <span>Safe to call this number</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={safeToMessage}
                        onChange={(e) => setSafeToMessage(e.target.checked)}
                        className="w-4 h-4 rounded text-[#3E5C54] focus:ring-[#3E5C54]"
                      />
                      <span>Safe to send SMS updates</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Optional Accessibility / Support Requirements */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Accessibility & Physical Support Requirements (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACCESSIBILITY_OPTIONS.map((opt) => {
                    const isChecked = accessibilityNeeds.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => handleToggleAccessibility(opt.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-[#E6ECE5] border-[#3E5C54] text-[#2F453F]'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-[#3E5C54] border-[#3E5C54] text-white' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 bg-red-50 text-red-900 border border-red-200 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 7. REVIEW BUTTON */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-[#3E5C54] hover:bg-[#2F453F] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Review Request Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-500">
                You will have an opportunity to review all selections before final submission.
              </p>
            </div>

          </form>
        )}

      </main>

    </div>
  );
};
