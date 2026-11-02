import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  MessageSquare,
  Building2,
  Phone,
  Shield,
  XCircle,
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { getSocket, subscribeToRequest } from '../../services/socket';

interface RequestTrackingScreenProps {
  requestReference: string;
  trackingToken?: string;
  onBackToHome: () => void;
  onOpenMessaging: (requestRef: string) => void;
  onGoToEmergency: () => void;
}

export const RequestTrackingScreen: React.FC<RequestTrackingScreenProps> = ({
  requestReference,
  trackingToken,
  onBackToHome,
  onOpenMessaging,
  onGoToEmergency
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const fetchTracking = () => {
    setLoading(true);
    apiClient.getTrackingDetails(requestReference)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Tracking fetch error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTracking();

    // Socket.IO real-time updates
    subscribeToRequest(requestReference);
    const socket = getSocket();

    const handleUpdate = () => {
      fetchTracking();
    };

    socket.on('referral_updated', handleUpdate);
    socket.on('request_referral_updated', handleUpdate);
    socket.on('status_changed', handleUpdate);

    return () => {
      socket.off('referral_updated', handleUpdate);
      socket.off('request_referral_updated', handleUpdate);
      socket.off('status_changed', handleUpdate);
    };
  }, [requestReference]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`Reference: ${requestReference}\nToken: ${trackingToken || data?.request?.trackingToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this assistance request?')) return;
    setCancelling(true);
    try {
      await apiClient.cancelRequest(requestReference);
      setCancelSuccess(true);
      fetchTracking();
    } catch (err: any) {
      alert(err.message || 'Unable to cancel request.');
    } finally {
      setCancelling(false);
    }
  };

  const referralStatus = data?.referral?.status || 'Submitted';
  const isCancelled = data?.request?.status === 'cancelled';

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

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTracking}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onGoToEmergency}
            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200"
          >
            Emergency 112
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Header Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D0DDD0] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-[#3E5C54]">
                Screen 6 · Confidential Request Tracker
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Assistance Request Status
              </h1>
            </div>

            <span className={`px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
              isCancelled
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : referralStatus === 'Accepted' || referralStatus === 'Arrival Confirmed'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              <span>{isCancelled ? 'Cancelled' : referralStatus}</span>
            </span>
          </div>

          {/* Reference & Token Box */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#D0DDD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Tracking Reference</div>
              <div className="font-mono font-bold text-base text-[#2F453F] select-all">
                {requestReference}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Token: {trackingToken || data?.request?.trackingToken || 'TRK-CONFIDENTIAL'}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#A3B899] rounded-xl text-xs font-semibold text-[#2F453F] hover:bg-[#F4F7F4] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Codes'}</span>
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onOpenMessaging(requestReference)}
            className="p-4 rounded-2xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Message Centre Caseworker (Screen 7)</span>
          </button>

          {!isCancelled && (
            <button
              onClick={handleCancelRequest}
              disabled={cancelling}
              className="p-4 rounded-2xl bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>{cancelling ? 'Cancelling...' : 'Cancel This Assistance Request'}</span>
            </button>
          )}
        </div>

        {/* Assigned Centre Card */}
        {data?.assignedOSC && (
          <div className="bg-white p-5 rounded-2xl border border-[#D0DDD0] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#3E5C54]">
              <Building2 className="w-4 h-4" />
              <span>Assigned One Stop Centre</span>
            </div>
            <div className="text-sm font-bold text-slate-900">{data.assignedOSC.name}</div>
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{data.assignedOSC.address || `${data.assignedOSC.district}, ${data.assignedOSC.state}`}</span>
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold pt-1">
              <a href="tel:181" className="text-[#3E5C54] flex items-center gap-1 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                <span>Helpline: 181</span>
              </a>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">24/7 Rapid Sanctuary Active</span>
            </div>
          </div>
        )}

        {/* Real-time Timeline */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D0DDD0] shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3E5C54]" />
            <span>Activity & Coordination Timeline</span>
          </h2>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D0DDD0]">
            {(data?.timeline || []).map((evt: any, i: number) => (
              <div key={evt._id || i} className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#3E5C54] border-2 border-white shadow-xs" />
                <div className="text-xs font-bold text-slate-900">{evt.title}</div>
                <p className="text-xs text-slate-600 mt-0.5">{evt.description}</p>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>{new Date(evt.timestamp).toLocaleString()}</span>
                  <span>·</span>
                  <span>By: {evt.performedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

    </div>
  );
};
