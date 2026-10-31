import React, { useState } from 'react';
import { X, Lock, ShieldCheck, UserCheck, ArrowRight, KeyRound, AlertCircle, Sparkles, Building2, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'beneficiary' | 'staff';
  onGuestContinue?: () => void;
  onStaffLoginSuccess?: (staffInfo: { name: string; role: string; centre: string }) => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialTab = 'beneficiary',
  onGuestContinue,
  onStaffLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'beneficiary' | 'staff'>(initialTab);
  
  // Beneficiary form state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [beneficiarySuccess, setBeneficiarySuccess] = useState(false);

  // Staff form state (OSC Staff Screen 1)
  const [staffEmail, setStaffEmail] = useState('manager.bangalore@sakhi.gov.in');
  const [staffPassword, setStaffPassword] = useState('••••••••••');
  const [staffRole, setStaffRole] = useState<'manager' | 'caseworker' | 'counsellor' | 'medical'>('manager');
  const [isStaffAuthenticating, setIsStaffAuthenticating] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffLoggedIn, setStaffLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleBeneficiarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (phone.length < 10) return;
      setOtpSent(true);
    } else {
      setBeneficiarySuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStaffAuthenticating(true);
    setStaffError(null);

    setTimeout(() => {
      setIsStaffAuthenticating(false);
      setStaffLoggedIn(true);
      if (onStaffLoginSuccess) {
        onStaffLoginSuccess({
          name: 'Priya Sharma, Lead Case Coordinator',
          role: staffRole === 'manager' ? 'OSC Centre Administrator' : 'OSC Case Manager',
          centre: 'Sakhi One Stop Centre, Bengaluru Urban'
        });
      }
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D0DDD0] overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="bg-[#F4F7F4] border-b border-[#D0DDD0] px-5 pt-4 pb-0">
          <div className="flex items-center justify-between pb-3">
            <h2 id="auth-modal-title" className="text-base sm:text-lg font-bold text-[#1F2937]">
              SakhiLink Access Portal
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-[#D0DDD0]">
            <button
              onClick={() => setActiveTab('beneficiary')}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'beneficiary'
                  ? 'border-[#3E5C54] text-[#2F453F]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Victim / Beneficiary</span>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'staff'
                  ? 'border-[#3E5C54] text-[#2F453F]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>OSC Staff Module</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {activeTab === 'beneficiary' ? (
            /* Beneficiary Portal */
            <div className="space-y-4">
              {/* Highlighted Guest Option */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] border-2 border-dashed border-[#A3B899] text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F453F] bg-white px-2.5 py-0.5 rounded-full border border-[#D0DDD0]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Recommended for Immediate Safety
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  No Registration or Account Needed
                </h3>
                <p className="text-xs text-slate-600">
                  Victims and individuals in distress can browse resources, find centres, and submit requests completely anonymously as a guest.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onGuestContinue) onGuestContinue();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Continue as Guest (Instant Access)</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink-0 mx-3 text-[11px] text-slate-400 font-medium">Or optional login with OTP</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {beneficiarySuccess ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
                  <div className="text-emerald-700 font-bold text-sm">Welcome back</div>
                  <p className="text-xs text-emerald-800">Your profile is safely recognized.</p>
                </div>
              ) : (
                <form onSubmit={handleBeneficiarySubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                    />
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        One-Time Passcode (OTP)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit OTP (demo: 123456)"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{otpSent ? 'Verify & Continue' : 'Send Confidential OTP'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Staff Login (Screen 1 OSC Staff Module) */
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <strong className="block font-semibold">OSC Staff Authentication:</strong>
                  Restricted to authorized One Stop Centre staff, caseworkers, medical personnel, and administrators under MWCD governance.
                </div>
              </div>

              {staffLoggedIn ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Authenticated as OSC Staff</h4>
                  <p className="text-xs text-slate-600">
                    Logged in as <strong>Priya Sharma</strong> (Role: {staffRole.toUpperCase()})
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-4 py-2 bg-[#3E5C54] text-white text-xs font-semibold rounded-xl"
                  >
                    Close & Continue
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStaffLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Government Email
                    </label>
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Staff Role Assignment
                    </label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-white"
                    >
                      <option value="manager">Centre Administrator / Manager</option>
                      <option value="caseworker">Case Manager / Coordinator</option>
                      <option value="counsellor">Psychosocial Counsellor</option>
                      <option value="medical">Medical Liaison Officer</option>
                    </select>
                  </div>

                  {staffError && (
                    <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{staffError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isStaffAuthenticating}
                    className="w-full py-2.5 rounded-xl bg-[#2F453F] hover:bg-[#21312C] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isStaffAuthenticating ? 'Validating Credentials...' : 'Staff Login (JWT Authenticated)'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
