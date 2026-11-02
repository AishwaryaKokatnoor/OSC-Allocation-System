import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  PhoneCall,
  ShieldCheck,
  Lock,
  Clock,
  HelpCircle,
  AlertTriangle,
  User,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { getSocket, subscribeToRequest } from '../../services/socket';

interface HelpCommunicationScreenProps {
  requestReference: string;
  onBackToTracking: () => void;
  onGoToEmergency: () => void;
}

export const HelpCommunicationScreen: React.FC<HelpCommunicationScreenProps> = ({
  requestReference,
  onBackToTracking,
  onGoToEmergency
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackTime, setCallbackTime] = useState('Morning (9 AM - 12 PM)');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    apiClient.getMessages(requestReference).then((msgs) => {
      if (msgs) setMessages(msgs);
    });
  };

  useEffect(() => {
    loadMessages();

    // Socket.IO real-time chat subscription
    subscribeToRequest(requestReference);
    const socket = getSocket();

    const handleNewMessage = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [requestReference]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const sent = await apiClient.sendMessage(requestReference, {
      messageText: newMessage.trim(),
      senderRole: 'victim',
      senderName: 'Beneficiary'
    });
    setSending(false);

    if (sent) {
      setNewMessage('');
    }
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.sendMessage(requestReference, {
      isCallbackRequest: true,
      messageText: `[Callback Request] Preferred Window: ${callbackTime}${callbackPhone ? ` · Safe Phone: ${callbackPhone}` : ''}`,
      senderRole: 'victim',
      senderName: 'Beneficiary',
      callbackDetails: { preferredTime: callbackTime, safePhone: callbackPhone }
    });
    setCallbackSuccess(true);
    setTimeout(() => {
      setShowCallbackModal(false);
      setCallbackSuccess(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1F2937] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#D0DDD0] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBackToTracking}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F453F] hover:text-[#1F2937] px-3 py-1.5 rounded-lg hover:bg-[#E6ECE5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tracker</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCallbackModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] border border-[#A3B899] text-[#2F453F] rounded-xl text-xs font-bold hover:bg-[#E6ECE5] transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#3E5C54]" />
            <span>Request Safe Callback</span>
          </button>
          <button
            onClick={onGoToEmergency}
            className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200"
          >
            Emergency 112
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-between">
        
        {/* Chat Window */}
        <div className="bg-white rounded-3xl border border-[#D0DDD0] shadow-sm flex flex-col h-[70vh] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 bg-[#F4F7F4] border-b border-[#D0DDD0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#3E5C54] text-white flex items-center justify-center font-bold text-xs">
                OSC
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">One Stop Centre Casework Desk</h2>
                <div className="text-[10px] text-[#52606D] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Confidential Channel · Reference: {requestReference}</span>
                </div>
              </div>
            </div>

            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Live & Logged
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-[#FAF9F5]/40">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <ShieldCheck className="w-8 h-8 text-[#A3B899] mx-auto" />
                <p className="text-xs">No messages yet. Send a message to your assigned centre coordinator below.</p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isVictim = m.senderRole === 'victim';

                return (
                  <div
                    key={m._id || idx}
                    className={`flex flex-col ${isVictim ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-slate-400 px-1 mb-0.5 font-medium">
                      {isVictim ? 'You' : m.senderName || 'Caseworker'} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm ${
                        isVictim
                          ? 'bg-[#3E5C54] text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-[#D0DDD0] rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {m.messageText}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#D0DDD0] flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message to the caseworker..."
              className="flex-1 px-4 py-2.5 bg-[#FAF9F5] rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-3 bg-[#3E5C54] hover:bg-[#2F453F] active:scale-95 disabled:opacity-50 text-white rounded-xl transition-all shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </main>

      {/* Safe Callback Request Modal */}
      {showCallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#D0DDD0] p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#3E5C54]" />
              <span>Schedule a Discreet Callback</span>
            </h3>

            {callbackSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center text-xs space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <div className="font-bold">Callback Request Logged</div>
                <p>The duty caseworker will call strictly within your specified safe window.</p>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Safe Contact Number (Optional if already provided in intake)
                  </label>
                  <input
                    type="tel"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    placeholder="+91 ••••• •••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Safe Time Window
                  </label>
                  <select
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                    <option value="Night (7 PM - 10 PM)">Night (7 PM - 10 PM)</option>
                  </select>
                </div>

                <div className="p-2.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-[11px] leading-tight">
                  Caseworkers use neutral numbers and will immediately disconnect if an unauthorized person answers.
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCallbackModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#3E5C54] hover:bg-[#2F453F] text-white font-bold rounded-xl"
                  >
                    Submit Callback Request
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
