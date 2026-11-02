import React, { useState } from 'react';
import {
  ArrowLeft,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  ExternalLink,
  MapPin,
  Navigation,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Home,
  Stethoscope,
  Scale,
  HeartHandshake,
  Layers,
  ChevronDown,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { EmergencyServiceCategory } from '../../types/database';
import { LANGUAGES } from '../../data/mockData';
import { apiClient } from '../../services/api';

interface Props {
  onBackToHome: () => void;
  onQuickExit?: () => void;
}

interface ServiceOption {
  id: EmergencyServiceCategory;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'shelter',
    title: 'Safe Shelter',
    desc: 'Immediate secure refuge, clean bedding, food, and 24/7 female guard protection.',
    icon: Home
  },
  {
    id: 'medical',
    title: 'Medical Assistance',
    desc: 'Acute first aid, trauma evaluation, emergency treatment, and hospital admission linkage.',
    icon: Stethoscope
  },
  {
    id: 'police',
    title: 'Police Assistance',
    desc: 'Coordination with female police officers, Zero FIR filing, and immediate protection orders.',
    icon: ShieldAlert
  },
  {
    id: 'legal',
    title: 'Legal Assistance',
    desc: 'Empanelled legal aid lawyers, court guidance, and domestic violence injunction support.',
    icon: Scale
  },
  {
    id: 'emotional',
    title: 'Emotional Support',
    desc: 'Immediate psychosocial crisis de-escalation, emotional reassurance, and trauma care.',
    icon: HeartHandshake
  },
  {
    id: 'multiple',
    title: 'Multiple Services',
    desc: 'Comprehensive multi-service care package addressing accommodation, healthcare, and law.',
    icon: Layers
  }
];

export const EmergencyAssistanceScreen: React.FC<Props> = ({
  onBackToHome,
  onQuickExit
}) => {
  // Section 3: Selected services (multiple allowed)
  const [selectedServices, setSelectedServices] = useState<EmergencyServiceCategory[]>(['shelter']);
  
  // Section 4: Location
  const [locationMode, setLocationMode] = useState<'manual' | 'gps' | 'none'>('manual');
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Section 5: Safe Communication
  const [preferredMode, setPreferredMode] = useState<'in_app' | 'phone' | 'sms' | 'no_direct_contact'>('in_app');
  const [contactNumber, setContactNumber] = useState('');
  const [safeToCall, setSafeToCall] = useState(true);
  const [safeToMessage, setSafeToMessage] = useState(true);
  const [safeTimeWindow, setSafeTimeWindow] = useState('Anytime safely');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Section 6: Submission & State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [idempotencyKey] = useState<string>(() => 'idemp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
  const [copiedToken, setCopiedToken] = useState(false);

  // Toggle service selection
  const handleToggleService = (srvId: EmergencyServiceCategory) => {
    if (srvId === 'multiple') {
      if (selectedServices.includes('multiple')) {
        setSelectedServices(['shelter']);
      } else {
        setSelectedServices(['shelter', 'medical', 'police', 'legal', 'emotional', 'multiple']);
      }
      return;
    }

    if (selectedServices.includes(srvId)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter(s => s !== srvId && s !== 'multiple'));
      }
    } else {
      setSelectedServices([...selectedServices.filter(s => s !== 'multiple'), srvId]);
    }
  };

  // Explicit GPS Location request
  const handleRequestGPS = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser. You can enter your district manually below.');
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        // Sanitize coordinates (approximate bounding box, never pinpoint precision)
        const approxLat = Math.round(position.coords.latitude * 100) / 100;
        const approxLng = Math.round(position.coords.longitude * 100) / 100;
        setGpsCoordinates({ lat: approxLat, lng: approxLng });
        setLocationMode('gps');
        setLocationNotice('Approximate location captured securely. Exact street address will not be shared.');
      },
      (error) => {
        setIsLocating(false);
        setLocationNotice(`Location access declined (${error.message}). You can proceed safely with manual district entry.`);
        setLocationMode('manual');
      },
      { timeout: 8000 }
    );
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Validation
    if (selectedServices.length === 0) {
      setSubmissionError('Please select at least one assistance service required.');
      return;
    }

    if (
      (preferredMode === 'phone' || preferredMode === 'sms') &&
      (!contactNumber || contactNumber.trim().length < 10)
    ) {
      setSubmissionError('Please provide a valid 10-digit mobile number for phone or SMS contact.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        idempotencyKey,
        isGuest: true,
        servicesRequested: selectedServices,
        location: {
          sharedViaGPS: locationMode === 'gps',
          district: locationMode === 'none' ? 'Undisclosed' : district,
          city: locationMode === 'none' ? '' : city,
          locality: locationMode === 'none' ? '' : locality,
          approxCoordinates: locationMode === 'gps' && gpsCoordinates ? gpsCoordinates : undefined
        },
        communication: {
          preferredMode,
          contactNumber: (preferredMode === 'phone' || preferredMode === 'sms') ? contactNumber.trim() : undefined,
          safeToCall,
          safeToMessage,
          safeTimeWindow,
          preferredLanguage
        },
        additionalDetails: additionalDetails.trim()
      };

      const result = await apiClient.submitEmergencyRequest(payload);
      setSuccessData(result);
    } catch (err: any) {
      setSubmissionError(err.message || 'Unable to connect to the SakhiLink network. Please check your connection or call 112 directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToken = () => {
    if (successData?.requestId) {
      navigator.clipboard.writeText(successData.requestId);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1F2937] font-sans pb-16">
      
      {/* SECTION 1: HEADER */}
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

          {/* Title and Badge */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm sm:text-base">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Emergency Assistance</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#52606D] truncate max-w-[200px] sm:max-w-none">
              Confidential Crisis Intake · 24/7 Response
            </span>
          </div>

          {/* Right Spacer for balance */}
          <div className="w-10 sm:w-20" />

        </div>

        {/* Safety Advisory Banner */}
        <div className="bg-amber-50 border-t border-b border-amber-200/80 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                <strong>Discreet Session:</strong> No account required. Your browsing and request remain confidential.
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* SECTION 2: EMERGENCY CONTACT (India 112 Prominent Box) */}
        <section aria-labelledby="emergency-contact-heading">
          <div className="relative rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-red-100 uppercase tracking-wider">
                  <AlertOctagon className="w-4 h-4 text-white" />
                  <span>National Emergency Police & Paramedics</span>
                </div>

                <h2 id="emergency-contact-heading" className="text-2xl sm:text-3xl font-black tracking-tight">
                  In Immediate Physical Danger? Dial 112
                </h2>

                <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
                  <strong>Important Notice:</strong> SakhiLink is a support case coordination and One Stop Centre intake portal, <strong>not an emergency dispatch service</strong>. Submitting a request below connects you to a case coordinator, but does <strong>not</strong> automatically dispatch police or ambulance to your location. For active physical threats or rescue, dial 112 directly.
                </p>
              </div>

              {/* Direct Click-to-Call 112 */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-red-700 hover:bg-red-50 active:scale-95 font-black text-base shadow-lg transition-all"
                >
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                  <span>Call 112 Directly</span>
                </a>

                <div className="flex items-center justify-center gap-3 text-xs text-red-200">
                  <a href="tel:181" className="hover:underline flex items-center gap-1">
                    <span>Call 181 (Women Line)</span>
                  </a>
                  <span>·</span>
                  <a href="tel:1091" className="hover:underline flex items-center gap-1">
                    <span>Call 1091 (Distress)</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SUCCESS / CONFIRMATION CARD (Rendered after successful backend submission) */}
        {successData ? (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-xl space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Request Registered Successfully
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Emergency Case Intake Initiated
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your emergency assistance request has been recorded securely in the database and transmitted to the duty case officers at <strong>{successData.matchedOsc?.name}</strong>.
              </p>
            </div>

            {/* Unique Request ID Card */}
            <div className="p-5 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] max-w-md mx-auto text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Unique Request ID
                </span>
                <button
                  onClick={handleCopyToken}
                  className="flex items-center gap-1 text-xs text-[#3E5C54] hover:underline font-semibold"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>
              <div className="text-2xl font-mono font-extrabold text-[#2F453F] tracking-wider select-all">
                {successData.requestId}
              </div>
              <p className="text-[11px] text-slate-500">
                Quote this code during a discreet walk-in or safe phone verification to identify your file without repeating traumatic details.
              </p>
            </div>

            {/* Crucial Statutory Clarification */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Next Operational Steps & Safety Status</span>
              </div>
              <p>
                • <strong>Notice:</strong> Submitting this request initiates case review by female caseworkers. <em>It does not mean a field team or vehicle has physically departed</em>. If you are being pursued or face acute violence right now, dial <strong>112</strong> immediately.
              </p>
              <p>
                • Case workers will follow your communication preference (<strong>{preferredMode.replace('_', ' ').toUpperCase()}</strong>) within your requested safe time window.
              </p>
              <p>
                • Direct 24/7 Centre Hotline: <strong>{successData.matchedOsc?.helpline}</strong>.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold shadow-xs transition-colors"
              >
                Return to SakhiLink Home
              </button>
              <button
                onClick={() => {
                  setSuccessData(null);
                  setSelectedServices(['shelter']);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </section>
        ) : (
          /* SECTION 3 - 6: ASSISTANCE REQUEST FORM */
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 3: QUICK ASSISTANCE (Multi-Select Services) */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D0DDD0] shadow-xs space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#3E5C54] text-white text-xs flex items-center justify-center font-bold">1</span>
                    <span>What Immediate Assistance Do You Need?</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Select all that apply</span>
                </div>
                <p className="text-xs text-slate-600">
                  Choose the specific crisis provisions you require from the One Stop Centre.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SERVICE_OPTIONS.map((service) => {
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

            {/* SECTION 4: LOCATION (Opt-In / Manual / Without Location) */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D0DDD0] shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#3E5C54] text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Your General Location (Optional & Consent-Based)</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Location is completely optional and strictly protected. SakhiLink never tracks your GPS automatically and never exposes exact street addresses publicly.
                </p>
              </div>

              {/* Mode Selection Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLocationMode('manual')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    locationMode === 'manual'
                      ? 'bg-[#3E5C54] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Enter District Manually
                </button>

                <button
                  type="button"
                  onClick={handleRequestGPS}
                  disabled={isLocating}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    locationMode === 'gps'
                      ? 'bg-[#3E5C54] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isLocating ? 'Capturing approximate area...' : 'Share Approximate GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLocationMode('none');
                    setGpsCoordinates(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    locationMode === 'none'
                      ? 'bg-[#3E5C54] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Continue Without Location
                </button>
              </div>

              {locationNotice && (
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>{locationNotice}</span>
                </div>
              )}

              {/* Manual Fields (Visible when in manual mode or gps confirmed) */}
              {locationMode !== 'none' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      District / Region
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                    >
                      <option value="Bengaluru Urban">Bengaluru Urban (Karnataka)</option>
                      <option value="Central Delhi">Central Delhi (Delhi NCR)</option>
                      <option value="Mumbai Suburban">Mumbai Suburban (Maharashtra)</option>
                      <option value="Hyderabad">Hyderabad (Telangana)</option>
                      <option value="Kolkata">Kolkata (West Bengal)</option>
                      <option value="Chennai">Chennai (Tamil Nadu)</option>
                      <option value="Other District">Other Region</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City / Town (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shivajinagar"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Locality / Nearby Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Bus Stand"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 5: SAFE COMMUNICATION PREFERENCES */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D0DDD0] shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#3E5C54] text-white text-xs flex items-center justify-center font-bold">3</span>
                  <span>Safe Communication & Contact Preferences</span>
                </h3>
                <p className="text-xs text-slate-600">
                  We strictly respect your communication instructions. Choose how caseworkers may safely interact with you.
                </p>
              </div>

              {/* Mode Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'in_app', label: 'In-App Tracking', desc: 'Discreet code only' },
                  { id: 'phone', label: 'Phone Call', desc: 'Only at safe hours' },
                  { id: 'sms', label: 'SMS Only', desc: 'Discreet text message' },
                  { id: 'no_direct_contact', label: 'No Contact', desc: 'Walk-in only at OSC' }
                ].map((mode) => (
                  <button
                    type="button"
                    key={mode.id}
                    onClick={() => setPreferredMode(mode.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      preferredMode === mode.id
                        ? 'bg-[#E6ECE5] border-[#3E5C54] text-[#2F453F] ring-1 ring-[#3E5C54]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{mode.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>

              {/* Phone / SMS Input */}
              {(preferredMode === 'phone' || preferredMode === 'sms') && (
                <div className="space-y-3 pt-2">
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Safe Time Window For Contact
                      </label>
                      <select
                        value={safeTimeWindow}
                        onChange={(e) => setSafeTimeWindow(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-white"
                      >
                        <option value="Anytime safely">Anytime safely</option>
                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                        <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                        <option value="Evening (3 PM - 7 PM)">Evening (3 PM - 7 PM)</option>
                        <option value="Night (7 PM - 10 PM)">Night (7 PM - 10 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* Safety toggles */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={safeToCall}
                        onChange={(e) => setSafeToCall(e.target.checked)}
                        className="w-4 h-4 rounded text-[#3E5C54] focus:ring-[#3E5C54]"
                      />
                      <span>Safe to call my phone</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={safeToMessage}
                        onChange={(e) => setSafeToMessage(e.target.checked)}
                        className="w-4 h-4 rounded text-[#3E5C54] focus:ring-[#3E5C54]"
                      />
                      <span>Safe to send SMS / WhatsApp</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Preferred Language */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Language for Case Officer Communication
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-white"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.name}>
                        {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Brief Urgent Context (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Need shelter with infant daughter"
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                  />
                </div>
              </div>
            </section>

            {/* Error Message Box */}
            {submissionError && (
              <div className="p-4 bg-red-50 text-red-900 border border-red-200 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Unable to process request</div>
                  <div>{submissionError}</div>
                </div>
              </div>
            )}

            {/* SECTION 6: SUBMISSION BUTTON */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold text-base tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Registering Emergency Case Confidentially...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5" />
                    <span>Request Immediate Assistance</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Confidential request under the Ministry of Women & Child Development Nirbhaya Initiative. Your information is protected under government privacy protocols.
              </p>
            </div>

          </form>
        )}

      </main>
    </div>
  );
};
