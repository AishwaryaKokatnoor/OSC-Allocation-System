import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Lock,
  User,
  Mail,
  Phone,
  BadgeCheck,
  KeyRound,
  ArrowRight,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { MOCK_OSC_CENTRES } from '../../data/mockData';
import { apiClient } from '../../services/api';

export interface StaffUserData {
  name: string;
  role: string;
  centre: string;
  badgeId?: string;
  email: string;
}

interface StaffAuthGatewayProps {
  onLoginSuccess: (user: StaffUserData) => void;
  onReturnToHome: () => void;
}

export const StaffAuthGateway: React.FC<StaffAuthGatewayProps> = ({
  onLoginSuccess,
  onReturnToHome
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('manager.bangalore@sakhi.gov.in');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [loginRole, setLoginRole] = useState<'OSC Centre Administrator' | 'OSC Case Manager' | 'Psychosocial Counsellor' | 'Medical Liaison Officer'>('OSC Centre Administrator');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBadgeId, setRegBadgeId] = useState('');
  const [regCentre, setRegCentre] = useState(MOCK_OSC_CENTRES[0]?.name || 'Sakhi One Stop Centre, Bengaluru Urban');
  const [regRole, setRegRole] = useState<'OSC Centre Administrator' | 'OSC Case Manager' | 'Psychosocial Counsellor' | 'Medical Liaison Officer'>('OSC Case Manager');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgreed, setRegAgreed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await apiClient.login(loginEmail, loginPassword, loginRole);
      if (res?.user && res?.token) {
        onLoginSuccess({
          name: res.user.name,
          role: loginRole,
          centre: 'Sakhi One Stop Centre, Bengaluru Urban (OSC-KA-BLR-01)',
          badgeId: res.user.badgeId || 'OSC-MGR-01',
          email: res.user.email
        });
      } else {
        setLoginError(res?.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Please provide your full legal name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please provide a valid official government or department email.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }
    if (!regAgreed) {
      setRegError('You must confirm authorization under One Stop Centre operational standards.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await apiClient.registerStaff({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        oscId: 'osc-ka-blr-01',
        phone: regPhone.trim(),
        badgeId: regBadgeId.trim() || `OSC-${Math.floor(1000 + Math.random() * 9000)}`
      });

      if (res?.user && res?.token) {
        setRegSuccess(true);
        setTimeout(() => {
          onLoginSuccess({
            name: res.user.name,
            role: regRole,
            centre: regCentre,
            badgeId: res.user.badgeId || regBadgeId,
            email: res.user.email
          });
        }, 1000);
      } else {
        setRegError(res?.error || 'Registration failed. Please check inputs.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Failed to register account.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDemoQuickLogin = async (role: 'OSC Centre Administrator' | 'OSC Case Manager') => {
    setIsLoggingIn(true);
    const email = role === 'OSC Centre Administrator' ? 'manager.bangalore@sakhi.gov.in' : 'priya.case@sakhi.gov.in';
    const res = await apiClient.login(email, 'SakhiLink2026!', role);
    setIsLoggingIn(false);
    if (res?.user) {
      onLoginSuccess({
        name: res.user.name,
        role,
        centre: 'Sakhi One Stop Centre, Bengaluru Urban (OSC-KA-BLR-01)',
        badgeId: res.user.badgeId,
        email: res.user.email
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex flex-col justify-between font-sans text-slate-800">
      
      {/* Top Bar with Return Navigation */}
      <header className="bg-white border-b border-[#D0DDD0] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={onReturnToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#2F453F] hover:text-[#1F2937] px-3 py-1.5 rounded-lg hover:bg-[#E6ECE5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Portal</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#3E5C54]" />
          <span className="hidden sm:inline">Ministry of Women & Child Development</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-700">OSC Secure Gateway</span>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-[#D0DDD0] overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-[#21312C] text-white p-6 sm:p-7 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-32 h-32 bg-[#52796F]/20 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#52796F] text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  SakhiLink — One Stop Centre Staff Portal
                </h1>
                <p className="text-xs text-[#A3B899]">
                  Authorized Personnel Management, Case Tracking & Shelter Capacity
                </p>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-[#2A3F38] border border-[#354F52] text-[11px] text-slate-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Restricted portal for appointed One Stop Centre managers, caseworkers, medical officers, and counsellors.
              </span>
            </div>
          </div>

          {/* Navigation Tabs: Staff Login & Staff Registration ONLY */}
          <div className="flex border-b border-[#D0DDD0] bg-[#FAF9F5]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'login'
                  ? 'border-[#3E5C54] text-[#2F453F] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-[#F4F7F4]'
              }`}
            >
              <KeyRound className="w-4 h-4 text-[#3E5C54]" />
              <span>Staff Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
              }}
              className={`flex-1 py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'register'
                  ? 'border-[#3E5C54] text-[#2F453F] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-[#F4F7F4]'
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#3E5C54]" />
              <span>Staff Registration</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'login' ? (
              /* TAB 1: STAFF LOGIN */
              <div className="space-y-5">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Official Government Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. manager.bangalore@sakhi.gov.in"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Appointed Role
                    </label>
                    <select
                      value={loginRole}
                      onChange={(e) => setLoginRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-white"
                    >
                      <option value="OSC Centre Administrator">Centre Administrator / Manager</option>
                      <option value="OSC Case Manager">Case Manager / Coordinator</option>
                      <option value="Psychosocial Counsellor">Psychosocial Counsellor</option>
                      <option value="Medical Liaison Officer">Medical Liaison Officer</option>
                    </select>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 rounded-xl bg-[#2F453F] hover:bg-[#21312C] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isLoggingIn ? 'Verifying Credentials...' : 'Sign In to Staff Portal'}</span>
                  </button>
                </form>

                {/* Quick Demo Logins for Testing */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                    Quick Testing Access:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDemoQuickLogin('OSC Centre Administrator')}
                      className="p-2.5 rounded-xl border border-[#A3B899] bg-[#F4F7F4] hover:bg-[#E6ECE5] text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-[#2F453F]">Login as Administrator</div>
                      <div className="text-[10px] text-slate-500">Ananya Deshmukh · Full Access</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoQuickLogin('OSC Case Manager')}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-slate-800">Login as Case Manager</div>
                      <div className="text-[10px] text-slate-500">Priya Sharma · Casework & Intake</div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: STAFF REGISTRATION */
              <div className="space-y-4">
                {regSuccess ? (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="font-bold text-slate-900 text-base">Registration Successful!</h3>
                    <p className="text-xs text-slate-600">
                      Your staff profile has been verified and registered. Opening your workspace...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Legal Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Dr. / Ms. Full Name"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Official Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="name@sakhi.gov.in"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Official Mobile Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Employee / Badge ID
                        </label>
                        <div className="relative">
                          <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={regBadgeId}
                            onChange={(e) => setRegBadgeId(e.target.value)}
                            placeholder="e.g. OSC-KA-2041"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Appointed Role
                        </label>
                        <select
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-white"
                        >
                          <option value="OSC Centre Administrator">Centre Administrator / Manager</option>
                          <option value="OSC Case Manager">Case Manager / Coordinator</option>
                          <option value="Psychosocial Counsellor">Psychosocial Counsellor</option>
                          <option value="Medical Liaison Officer">Medical Liaison Officer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Assigned One Stop Centre
                        </label>
                        <select
                          value={regCentre}
                          onChange={(e) => setRegCentre(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-white truncate"
                        >
                          {MOCK_OSC_CENTRES.map((centre) => (
                            <option key={centre.id} value={centre.name}>
                              {centre.name} ({centre.district})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Create Password
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={regAgreed}
                          onChange={(e) => setRegAgreed(e.target.checked)}
                          className="mt-0.5 rounded text-[#3E5C54] focus:ring-[#3E5C54]"
                        />
                        <span className="text-[11px] text-slate-600 leading-tight">
                          I confirm that I am an authorized employee or empanelled specialist assigned to this One Stop Centre under the Ministry of Women & Child Development.
                        </span>
                      </label>
                    </div>

                    {regError && (
                      <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full py-3 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isRegistering ? 'Registering Staff Account...' : 'Complete Staff Registration'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer Note */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        SakhiLink OSC Portal · Confidential Official Access System
      </footer>

    </div>
  );
};
