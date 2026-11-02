import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Sparkles,
  MapPin,
  Bed,
  Check,
  ChevronRight,
  ArrowRight,
  Shield,
  Layers,
  HelpCircle,
  Clock,
  Phone
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface RecommendedSupportScreenProps {
  requestReference: string;
  onBackToDiscovery: () => void;
  onConfirmReferral: (referral: any, requestRef: string) => void;
  onGoToEmergency: () => void;
}

export const RecommendedSupportScreen: React.FC<RecommendedSupportScreenProps> = ({
  requestReference,
  onBackToDiscovery,
  onConfirmReferral,
  onGoToEmergency
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralNotes, setReferralNotes] = useState('');

  useEffect(() => {
    setLoading(true);
    apiClient.getOSCRecommendations(requestReference)
      .then((res) => {
        setData(res);
        if (res?.recommendations?.length > 0) {
          setSelectedCentreId(res.recommendations[0]._id || res.recommendations[0].centreCode);
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to load recommendations.');
      })
      .finally(() => setLoading(false));
  }, [requestReference]);

  const handleConfirmSelection = async () => {
    if (!selectedCentreId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.confirmReferral(requestReference, selectedCentreId, referralNotes);
      if (res?.referral) {
        onConfirmReferral(res.referral, requestReference);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit referral to centre.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1F2937] flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#D0DDD0] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBackToDiscovery}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F453F] hover:text-[#1F2937] px-3 py-1.5 rounded-lg hover:bg-[#E6ECE5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Centre Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono bg-[#E6ECE5] text-[#2F453F] px-2.5 py-1 rounded-full font-bold">
            Request: {requestReference}
          </span>
          <button
            onClick={onGoToEmergency}
            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200"
          >
            Emergency 112
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#21312C] to-[#2F453F] text-white p-6 sm:p-7 rounded-3xl shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-7 h-7 rounded-lg bg-[#52796F] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-[#A3B899]">
              Screen 5 · Weighted Matching Algorithm
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Recommended One Stop Centres
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Centres evaluated against your requested services ({data?.requestedServices?.join(', ') || 'Shelter'}), verified capacity, and safe geographical proximity.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-emerald-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">Distance (35%)</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">Verified Capacity (30%)</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">Services Match (25%)</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">Accessibility (10%)</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-3 border-[#3E5C54] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Evaluating centres across district network...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Ranked Matching Results ({data?.recommendations?.length || 0} Centres Available)
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {data?.recommendations?.map((centre: any, idx: number) => {
                const isSelected = selectedCentreId === (centre._id || centre.centreCode);
                const score = centre.recommendation?.score || 85;

                return (
                  <div
                    key={centre._id || centre.centreCode}
                    onClick={() => setSelectedCentreId(centre._id || centre.centreCode)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-[#3E5C54] ring-2 ring-[#3E5C54]/20 shadow-md'
                        : 'border-[#D0DDD0] hover:border-slate-400'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left: Centre Details */}
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            #{idx + 1}
                          </span>
                          <h3 className="font-bold text-base text-slate-900">{centre.name}</h3>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {centre.centreCode}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{centre.address || `${centre.district}, ${centre.state}`}</span>
                        </p>

                        <div className="p-2.5 rounded-xl bg-[#F4F7F4] border border-[#D0DDD0] text-xs text-[#2F453F] flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#3E5C54] shrink-0 mt-0.5" />
                          <span><strong>Why Recommended:</strong> {centre.recommendation?.explanation}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(centre.servicesOffered || []).map((srv: string) => (
                            <span key={srv} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Score & Capacity Indicator */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-black font-mono text-[#2F453F]">
                            {score}<span className="text-xs font-normal text-slate-400">/100</span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Match Score
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Bed className="w-4 h-4 text-[#3E5C54]" />
                          <span className="font-bold text-slate-900">
                            {centre.intakeCapacity?.currentAvailableBeds ?? 8} Beds
                          </span>
                          <span className="text-[10px] text-slate-400">Available</span>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#3E5C54] border-[#3E5C54] text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confirmation Drawer */}
            <div className="bg-white p-6 rounded-3xl border border-[#D0DDD0] shadow-lg space-y-4 mt-6">
              <h3 className="font-bold text-slate-900 text-sm">
                Confirm Selected Centre & Send Referral
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Optional Note for the Centre Caseworker
                </label>
                <textarea
                  rows={2}
                  value={referralNotes}
                  onChange={(e) => setReferralNotes(e.target.value)}
                  placeholder="e.g. Requesting medical examination upon arrival; require ground floor accessibility."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-500">
                  Selecting a centre dispatches an official referral to the OSC coordination desk.
                </span>

                <button
                  type="button"
                  disabled={!selectedCentreId || submitting}
                  onClick={handleConfirmSelection}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#3E5C54] hover:bg-[#2F453F] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{submitting ? 'Creating Referral Record...' : 'Confirm OSC & Create Referral (Screen 6)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
