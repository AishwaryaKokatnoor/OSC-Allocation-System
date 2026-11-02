import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Shield,
  Clock,
  Filter
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { getSocket, subscribeToRequest } from '../../services/socket';

interface VictimNotificationsScreenProps {
  requestReference: string;
  onBackToHome: () => void;
  onGoToEmergency: () => void;
  onOpenTracking: (ref: string) => void;
}

export const VictimNotificationsScreen: React.FC<VictimNotificationsScreenProps> = ({
  requestReference,
  onBackToHome,
  onGoToEmergency,
  onOpenTracking
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'referral_status' | 'message' | 'capacity_alert'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    setLoading(true);
    apiClient.getVictimNotifications(requestReference)
      .then((res) => {
        if (res) setNotifications(res);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();

    // Subscribe to Socket.IO channel
    subscribeToRequest(requestReference);
    const socket = getSocket();

    const handleNewNotif = (notif: any) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on('notification_received', handleNewNotif);

    return () => {
      socket.off('notification_received', handleNewNotif);
    };
  }, [requestReference]);

  const handleMarkAllRead = async () => {
    await apiClient.markAllVictimNotificationsRead(requestReference);
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  };

  const filteredNotifs = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

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
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-[#3E5C54] hover:underline px-2 py-1"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onGoToEmergency}
            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200"
          >
            Emergency 112
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#3E5C54]" />
              <span>Assistance Notifications</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Updates for Reference: <span className="font-mono font-bold">{requestReference}</span>
            </p>
          </div>

          <span className="text-xs font-bold bg-[#E6ECE5] text-[#2F453F] px-3 py-1 rounded-full">
            {unreadCount} Unread
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#D0DDD0]">
          {(['all', 'referral_status', 'message', 'capacity_alert'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === cat
                  ? 'bg-[#3E5C54] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-[#F4F7F4] border border-[#D0DDD0]'
              }`}
            >
              {cat === 'all' ? 'All Updates' : cat === 'referral_status' ? 'Referrals' : cat === 'message' ? 'Messages' : 'Alerts'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading notifications...</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#D0DDD0] p-8 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">You are all caught up!</h3>
            <p className="text-xs text-slate-500">No pending notifications for this assistance request.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((n, idx) => (
              <div
                key={n._id || idx}
                onClick={() => onOpenTracking(requestReference)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  !n.readAt
                    ? 'bg-white border-[#3E5C54] shadow-xs ring-1 ring-[#3E5C54]/20'
                    : 'bg-white/80 border-[#D0DDD0] hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F7F4] text-[#3E5C54] flex items-center justify-center shrink-0 mt-0.5 border border-[#D0DDD0]">
                    {n.type === 'message' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : n.type === 'capacity_alert' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">{n.title}</div>
                    <p className="text-xs text-slate-600">{n.message}</p>
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {!n.readAt && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  );
};
