import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Trash2,
  LogOut,
  Bell,
  EyeOff,
  MapPin,
  Check,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface VictimPrivacySettingsScreenProps {
  requestReference?: string;
  onBackToHome: () => void;
  onTerminateSession: () => void;
  onGoToEmergency: () => void;
}

export const VictimPrivacySettingsScreen: React.FC<VictimPrivacySettingsScreenProps> = ({
  requestReference,
  onBackToHome,
  onTerminateSession,
  onGoToEmergency
}) => {
  const [discreetMode, setDiscreetMode] = useState(true);
  const [locationConsent, setLocationConsent] = useState(false);
  const [safeContactMethod, setSafeContactMethod] = useState<'in_person_only' | 'sms' | 'phone'>('in_person_only');
  const [safeWindow, setSafeWindow] = useState('Morning (9 AM - 12 PM)');
  
  // Data deletion state
  const [deleteReason, setDeleteReason] = useState('Case resolved safely');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  const handleDataDeletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    try {
      if (requestReference) {
        await apiClient.requestDataDeletion(requestReference, undefined, deleteReason);
      }
      setDeletedSuccess(true);
      setTimeout(() => {
        onTerminateSession();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit data deletion request.');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1F2937] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#D0DDD0] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F453F] hover:text-[#1F2937] px-3 py-1.5 rounded-lg hover:bg-[#E6ECE5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={onGoToEmergency}
          className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200"
        >
          Emergency 112
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#3E5C54]">
            Screen 9 · Security & Rights
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Privacy, Consent & Safety Settings
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Under India's Digital Personal Data Protection standards and Nirbhaya Fund governance, you maintain complete sovereignty over your assistance session.
          </p>
        </div>

        {/* Section 1: Safe Communication Settings */}
        <div className="bg-white p-6 rounded-3xl border border-[#D0DDD0] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#3E5C54]" />
            <span>Safe Contact Preferences</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Preferred Mode of Receiving Referral Updates
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'in_person_only', label: 'In-Person Only', desc: 'No phone calls or texts' },
                  { id: 'sms', label: 'Discreet SMS', desc: 'Neutral notification code' },
                  { id: 'phone', label: 'Direct Phone', desc: 'Specified safe hours only' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSafeContactMethod(opt.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      safeContactMethod === opt.id
                        ? 'border-[#3E5C54] bg-[#F4F7F4] font-semibold text-[#2F453F]'
                        : 'border-[#D0DDD0] bg-white text-slate-600'
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {safeContactMethod === 'phone' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Safe Hours for Caseworker Contact</label>
                <select
                  value={safeWindow}
                  onChange={(e) => setSafeWindow(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                  <option value="Night (7 PM - 10 PM)">Night (7 PM - 10 PM)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Location Consent Toggle */}
        <div className="bg-white p-6 rounded-3xl border border-[#D0DDD0] shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#3E5C54]" />
            <span>Consent-Based Geolocation</span>
          </h2>
          <p className="text-xs text-slate-600">
            SakhiLink never queries GPS coordinates without your explicit, per-session permission. If toggled off, OSC search defaults strictly to manual district selection.
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-800">
              Enable GPS Location Finding
            </span>
            <button
              type="button"
              onClick={() => setLocationConsent(!locationConsent)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                locationConsent ? 'bg-[#3E5C54]' : 'bg-slate-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                locationConsent ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Section 3: Session Termination & Data Deletion */}
        <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-red-950 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Session Termination & Statutory Data Deletion</span>
          </h2>

          <p className="text-xs text-slate-600">
            You can immediately terminate your current browsing session, purge locally cached tracking keys, or file a permanent statutory data deletion request.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={onTerminateSession}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminate Session (Clear Cache)</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-3.5 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Request Data Deletion Workflow</span>
            </button>
          </div>
        </div>

      </main>

      {/* Data Deletion Workflow Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-red-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Statutory Data Deletion Request</span>
            </div>

            {deletedSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-center text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold">Data Deletion Processed</div>
                <p>Personal identifiable fields have been anonymized. Terminating session...</p>
              </div>
            ) : (
              <form onSubmit={handleDataDeletionSubmit} className="space-y-3 text-xs">
                <p className="text-slate-600">
                  This will immediately cancel the active intake request ({requestReference || 'Active Session'}), anonymize all contact records in MongoDB, and purge local tracking tokens.
                </p>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Deletion Request</label>
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Case resolved safely">Case resolved safely</option>
                    <option value="Personal privacy preference">Personal privacy preference</option>
                    <option value="No longer in need of shelter or assistance">No longer in need of shelter or assistance</option>
                    <option value="Referred to alternate confidential support">Referred to alternate confidential support</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deleting}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                  >
                    {deleting ? 'Processing...' : 'Confirm & Purge Records'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
