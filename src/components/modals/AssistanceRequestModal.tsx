import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Shield, HeartHandshake, Phone, MessageSquare, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import { ServiceType, AssistanceRequestPayload } from '../../types';
import { SERVICES_DATA } from '../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceType;
}

export const AssistanceRequestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialService = 'shelter'
}) => {
  const [selectedService, setSelectedService] = useState<ServiceType>(initialService);
  const [isGuest, setIsGuest] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'whatsapp' | 'sms' | 'in_person_only'>('phone');
  const [contactNumber, setContactNumber] = useState('');
  const [safeTimeToCall, setSafeTimeToCall] = useState('Anytime safely');
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [needShelter, setNeedShelter] = useState(false);
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'critical'>('routine');
  const [notes, setNotes] = useState('');
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
      if (initialService === 'shelter') {
        setNeedShelter(true);
      }
    }
  }, [initialService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Generate a confidential token
    setTimeout(() => {
      const randomId = 'SKH-' + Math.floor(100000 + Math.random() * 900000);
      setSubmittedToken(randomId);
      setIsSubmitting(false);
    }, 600);
  };

  const handleResetAndClose = () => {
    setSubmittedToken(null);
    onClose();
  };

  const activeServiceObj = SERVICES_DATA.find(s => s.id === selectedService) || SERVICES_DATA[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D0DDD0] overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 bg-[#F4F7F4] border-b border-[#D0DDD0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#3E5C54] text-white flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-[#1F2937]">
                Request Confidential Assistance
              </h2>
              <p className="text-xs text-[#52606D]">
                Free, confidential support from government-certified One Stop Centres
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto">
          {submittedToken ? (
            /* Confirmation screen */
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Request Confirmed
                </span>
                <h3 className="text-2xl font-bold text-slate-900">
                  Assistance Request Registered
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your confidential request has been routed to the duty caseworkers at the selected One Stop Centre.
                </p>
              </div>

              {/* Reference ID card */}
              <div className="bg-[#FAF9F5] border border-[#D0DDD0] rounded-xl p-4 max-w-sm mx-auto text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Confidential Case Reference ID
                </p>
                <div className="font-mono text-xl sm:text-2xl font-bold text-[#2F453F] tracking-wider select-all">
                  {submittedToken}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  You can quote this number anonymously during a walk-in or callback.
                </p>
              </div>

              {/* Safety Guidance */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-left text-xs sm:text-sm text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Important Safety Reminders</span>
                </div>
                <p>
                  • If you requested a callback, a female officer will contact you only during your specified safe time window.
                </p>
                <p>
                  • If you prefer walk-in support, you can proceed directly to any district One Stop Centre with this Reference ID.
                </p>
                <p>
                  • In case of immediate physical crisis, dial <strong>112</strong> immediately.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white font-medium text-sm transition-colors shadow-sm"
                >
                  Return to Home
                </button>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Privacy Banner */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F4F7F4] border border-[#D0DDD0] text-xs text-[#2F453F]">
                <Lock className="w-4 h-4 mt-0.5 text-[#3E5C54] shrink-0" />
                <div>
                  <span className="font-semibold">Safe & Anonymous Access:</span> No login or official ID required. You are currently submitting as a <strong>{isGuest ? 'Guest Beneficiary' : 'Registered Beneficiary'}</strong>.
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Primary Service Needed
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICES_DATA.map((srv) => {
                    const isSelected = selectedService === srv.id;
                    return (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => setSelectedService(srv.id)}
                        className={`text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-[#3E5C54] text-white border-[#3E5C54] shadow-sm'
                            : 'bg-white hover:bg-[#FAF9F5] text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="font-semibold">{srv.title}</div>
                        <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {srv.availability}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Selected: <span className="font-medium text-slate-700">{activeServiceObj.title}</span> — {activeServiceObj.shortDesc}
                </p>
              </div>

              {/* Guest / Identification Mode */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Identity Preference
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsGuest(true)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                        isGuest ? 'bg-[#3E5C54] text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Anonymous / Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGuest(false)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                        !isGuest ? 'bg-[#3E5C54] text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Provide Name
                    </button>
                  </div>
                </div>

                {!isGuest && (
                  <div>
                    <input
                      type="text"
                      placeholder="Preferred name or alias (optional)"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-[#FAF9F5]"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      You can use any comfortable pseudonym. It will only be used to address you respectfully.
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Method & Safety Protocol */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  How should we safely connect with you?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'phone', label: 'Phone Call', icon: Phone },
                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                    { id: 'sms', label: 'SMS Only', icon: MessageSquare },
                    { id: 'in_person_only', label: 'Walk-in Only', icon: Shield }
                  ].map((method) => {
                    const isPicked = contactMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setContactMethod(method.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium gap-1.5 transition-all ${
                          isPicked
                            ? 'bg-[#E6ECE5] border-[#3E5C54] text-[#2F453F] ring-1 ring-[#3E5C54]'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{method.label}</span>
                      </button>
                    );
                  })}
                </div>

                {contactMethod !== 'in_person_only' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Safe Contact Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-[#FAF9F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Safe Time Window for Contact
                      </label>
                      <select
                        value={safeTimeToCall}
                        onChange={(e) => setSafeTimeToCall(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-[#FAF9F5]"
                      >
                        <option value="Anytime safely">Anytime safely</option>
                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                        <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                        <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                        <option value="Only on weekends">Only on weekends</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <strong>Walk-in Only:</strong> No phone number needed. After submission, you will receive your reference code and direct address directions to the nearest OSC.
                  </div>
                )}
              </div>

              {/* District & Shelter Check */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    District / Region in India
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-[#FAF9F5]"
                  >
                    <option value="Bengaluru Urban">Bengaluru Urban (Karnataka)</option>
                    <option value="Central Delhi">Central Delhi (Delhi NCR)</option>
                    <option value="Mumbai Suburban">Mumbai Suburban (Maharashtra)</option>
                    <option value="Hyderabad">Hyderabad (Telangana)</option>
                    <option value="Kolkata">Kolkata (West Bengal)</option>
                    <option value="Chennai">Chennai (Tamil Nadu)</option>
                    <option value="Other District">Other District (Manual Selection)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-[#FAF9F5]"
                  >
                    <option value="routine">Routine Support / Consultation</option>
                    <option value="urgent">Urgent Support Needed (within 2 hours)</option>
                    <option value="critical">Critical / Threat to Safety (Immediate)</option>
                  </select>
                </div>
              </div>

              {/* Immediate Shelter Requirement Checkbox */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60">
                <input
                  type="checkbox"
                  id="shelter-checkbox"
                  checked={needShelter}
                  onChange={(e) => setNeedShelter(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3E5C54] focus:ring-[#3E5C54] border-gray-300"
                />
                <label htmlFor="shelter-checkbox" className="text-xs text-amber-950 font-medium cursor-pointer">
                  I require immediate safe shelter accommodation (and accompanying children if applicable).
                </label>
              </div>

              {/* Optional brief message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Brief Details or Specific Concerns (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Share only what you feel safe writing..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-[#FAF9F5]"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering safely...</span>
                  ) : (
                    <>
                      <span>Submit Request Confidentially</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
