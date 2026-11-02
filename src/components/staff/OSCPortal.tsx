import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { getSocket, subscribeToOSC } from '../../services/socket';
import {
  LayoutDashboard,
  Building,
  Bed,
  CheckCircle2,
  FolderGit2,
  FileText,
  Bell,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Clock,
  Phone,
  Calendar,
  Lock,
  Download,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import {
  CURRENT_OSC,
  INITIAL_CAPACITY,
  INITIAL_CAPACITY_LOGS,
  INITIAL_SERVICES,
  INITIAL_REFERRALS,
  INITIAL_CASES,
  INITIAL_CASE_NOTES,
  INITIAL_FOLLOW_UPS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STAFF,
  INITIAL_AUDIT_LOGS
} from '../../data/oscMockData';
import {
  ReferralStatus,
  ServiceStatus,
  CaseLifecycleStatus,
  StaffRole
} from '../../types/database';

interface OSCPortalProps {
  onLogout: () => void;
  onReturnToVictimHome?: () => void;
  currentUserRole?: string;
  currentStaffName?: string;
}

export type StaffNavSection =
  | 'dashboard'
  | 'osc_profile'
  | 'shelter_capacity'
  | 'service_availability'
  | 'referrals'
  | 'cases'
  | 'notifications'
  | 'reports'
  | 'staff_mgmt'
  | 'settings';

export const OSCPortal: React.FC<OSCPortalProps> = ({
  onLogout,
  currentUserRole = 'OSC Centre Administrator',
  currentStaffName = 'Priya Sharma'
}) => {
  const [activeNav, setActiveNav] = useState<StaffNavSection>('dashboard');
  
  // Live OSC State mirroring MongoDB collections
  const [oscProfile, setOscProfile] = useState(CURRENT_OSC);
  const [capacity, setCapacity] = useState(INITIAL_CAPACITY);
  const [capacityLogs, setCapacityLogs] = useState(INITIAL_CAPACITY_LOGS);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [referrals, setReferrals] = useState(INITIAL_REFERRALS);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [caseNotes, setCaseNotes] = useState(INITIAL_CASE_NOTES);
  const [followUps, setFollowUps] = useState(INITIAL_FOLLOW_UPS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [staffList, setStaffList] = useState(INITIAL_STAFF);

  // Filter states
  const [referralFilter, setReferralFilter] = useState<string>('All');
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // New Note state
  const [newNoteText, setNewNoteText] = useState('');

  // Mobile sidebar open
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Analytics Report State
  const [analyticsReport, setAnalyticsReport] = useState<any>({
    averageResponseMinutes: 14.2,
    acceptanceRate: 92.4,
    shelterUtilization: 68.5,
    totalReferrals: 0,
    acceptedReferrals: 0,
    activeCases: 0,
    availableBeds: 8,
    occupiedBeds: 18,
    totalBeds: 30
  });

  // Add Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('case_manager');
  const [newStaffBadge, setNewStaffBadge] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // --- Real-time Socket.IO and Database Loading ---
  useEffect(() => {
    // Join room for this OSC
    subscribeToOSC('osc-ka-blr-01');

    // 1. Fetch Capacity
    apiClient.getCapacity().then((cap) => {
      if (cap) setCapacity(cap);
    });

    // 2. Fetch Capacity Logs
    apiClient.getCapacityLogs().then((logs) => {
      if (logs && logs.length > 0) setCapacityLogs(logs);
    });

    // 3. Fetch Services
    apiClient.getServices().then((srvs) => {
      if (srvs && srvs.length > 0) setServices(srvs);
    });

    // 4. Fetch Referrals
    apiClient.getReferrals().then((refs) => {
      if (refs && refs.length > 0) {
        setReferrals(refs);
        if (!selectedReferral) setSelectedReferral(refs[0]);
      }
    });

    // 5. Fetch Cases
    apiClient.getCases().then((cs) => {
      if (cs && cs.length > 0) {
        setCases(cs);
        if (!selectedCase) setSelectedCase(cs[0]);
      }
    });

    // 6. Fetch Notifications
    apiClient.getStaffNotifications().then((notifs) => {
      if (notifs && notifs.length > 0) setNotifications(notifs);
    });

    // 7. Fetch Staff List
    apiClient.getStaffMembers().then((st) => {
      if (st && st.length > 0) setStaffList(st);
    });

    // 8. Fetch Reports Analytics
    apiClient.getAnalyticsReports().then((rep) => {
      if (rep) setAnalyticsReport(rep);
    });

    // Socket.IO event bindings
    const socket = getSocket();

    const handleCapacityUpdate = (newCap: any) => {
      setCapacity(newCap);
    };

    const handleReferralUpdate = (newRef: any) => {
      setReferrals((prev) => {
        const idx = prev.findIndex((r) => r._id === newRef._id || r.referralCode === newRef.referralCode);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = newRef;
          return updated;
        }
        return [newRef, ...prev];
      });
      // Refresh analytics
      apiClient.getAnalyticsReports().then((rep) => {
        if (rep) setAnalyticsReport(rep);
      });
    };

    const handleNotificationReceived = (notif: any) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on('capacity_updated', handleCapacityUpdate);
    socket.on('referral_updated', handleReferralUpdate);
    socket.on('notification_received', handleNotificationReceived);

    return () => {
      socket.off('capacity_updated', handleCapacityUpdate);
      socket.off('referral_updated', handleReferralUpdate);
      socket.off('notification_received', handleNotificationReceived);
    };
  }, []);

  // Shelter Capacity Formula Handler: A = T - O - U (Persisted to MongoDB)
  const handleUpdateCapacity = async (occupiedDelta: number) => {
    const action = occupiedDelta > 0 ? 'admission' : 'discharge';
    const res = await apiClient.updateCapacity(action, Math.abs(occupiedDelta));
    if (res?.capacity) {
      setCapacity(res.capacity);
      if (res.log) {
        setCapacityLogs((prev) => [res.log, ...prev]);
      }
    } else if (res?.error) {
      alert(res.error);
    }
  };

  // Referral status updater (Persisted to MongoDB)
  const handleUpdateReferralStatus = async (id: string, newStatus: ReferralStatus) => {
    let rejectionReason: string | undefined;
    if (newStatus === 'Declined') {
      const promptReason = prompt('Specify reason for referral rejection / transfer:', 'Referred to alternate specialized OSC');
      if (!promptReason) return;
      rejectionReason = promptReason;
    }

    const updated = await apiClient.updateReferralStatus(id, newStatus, rejectionReason);
    if (updated) {
      setReferrals((prev) =>
        prev.map((ref) => (ref._id === id || ref.referralCode === id ? updated : ref))
      );
      if (selectedReferral && (selectedReferral._id === id || selectedReferral.referralCode === id)) {
        setSelectedReferral(updated);
      }
      // Re-fetch analytics
      apiClient.getAnalyticsReports().then((rep) => {
        if (rep) setAnalyticsReport(rep);
      });
    }
  };

  // Case lifecycle updater (Persisted to MongoDB)
  const handleUpdateCaseStatus = async (id: string, newStatus: CaseLifecycleStatus) => {
    const updated = await apiClient.updateCaseStatus(id, newStatus);
    if (updated) {
      setCases((prev) =>
        prev.map((c) => (c._id === id || c.caseCode === id ? updated : c))
      );
      if (selectedCase && (selectedCase._id === id || selectedCase.caseCode === id)) {
        setSelectedCase(updated);
      }
    }
  };

  // Add Case Note (Persisted to MongoDB)
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedCase) return;

    const created = await apiClient.addCaseNote(selectedCase._id, newNoteText.trim());
    if (created) {
      setCaseNotes((prev) => [created, ...prev]);
      setNewNoteText('');
    }
  };

  // Toggle Service Status (Persisted to MongoDB)
  const handleToggleService = async (srvId: string) => {
    const current = services.find((s) => s._id === srvId);
    if (!current) return;
    const nextStatus: ServiceStatus =
      current.status === 'Available' ? 'Limited' : current.status === 'Limited' ? 'Unavailable' : 'Available';

    const updated = await apiClient.updateServiceStatus(srvId, nextStatus);
    if (updated) {
      setServices((prev) => prev.map((s) => (s._id === srvId ? updated : s)));
    }
  };

  // Mark all notifications read
  const handleMarkAllNotifications = async () => {
    await apiClient.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  };

  // Export CSV Handler
  const handleExportCSV = async () => {
    const csvContent = await apiClient.exportReportCSV();
    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SakhiLink-OSC-Analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Add Staff Member Submit
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;

    const created = await apiClient.createStaffMember({
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      badgeId: newStaffBadge || `OSC-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: newStaffPhone || '+91 98450 00000'
    });

    if (created) {
      setStaffList((prev) => [...prev, created]);
      setShowAddStaffModal(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffBadge('');
      setNewStaffPhone('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex text-slate-800">
      
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#21312C] text-slate-200 flex flex-col justify-between transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Workspace Title */}
          <div className="p-5 border-b border-[#354F52] bg-[#1A2723]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#52796F] text-white flex items-center justify-center font-bold">
                  SK
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-tight">SakhiLink — OSC Portal</h1>
                  <p className="text-[10px] text-[#A3B899] font-mono">{oscProfile.centreCode}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-slate-300 leading-tight">
              Authenticated workspace · Centre-specific access
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-6 text-xs">
            {/* Primary Dashboard */}
            <div>
              <button
                onClick={() => {
                  setActiveNav('dashboard');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  activeNav === 'dashboard'
                    ? 'bg-[#52796F] text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Centre Operations */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#A3B899]">
                Centre Operations
              </div>
              <button
                onClick={() => {
                  setActiveNav('osc_profile');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  activeNav === 'osc_profile'
                    ? 'bg-[#52796F] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>OSC Profile</span>
              </button>
              <button
                onClick={() => {
                  setActiveNav('shelter_capacity');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  activeNav === 'shelter_capacity'
                    ? 'bg-[#52796F] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bed className="w-4 h-4" />
                  <span>Shelter Capacity</span>
                </div>
                <span className="font-mono text-[10px] bg-[#1A2723] px-1.5 py-0.5 rounded text-emerald-300">
                  {capacity.availableBeds} Avail
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveNav('service_availability');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  activeNav === 'service_availability'
                    ? 'bg-[#52796F] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Service Availability</span>
              </button>
            </div>

            {/* Coordination */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#A3B899]">
                Coordination
              </div>
              <button
                onClick={() => {
                  setActiveNav('referrals');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  activeNav === 'referrals'
                    ? 'bg-[#52796F] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderGit2 className="w-4 h-4" />
                  <span>Referral Management</span>
                </div>
                <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                  {referrals.filter((r) => r.status === 'New').length} New
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveNav('cases');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  activeNav === 'cases'
                    ? 'bg-[#52796F] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Case Coordination</span>
              </button>
            </div>

            {/* Insights */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#A3B899]">
                Insights
              </div>
              <button
                onClick={() => {
                  setActiveNav('notifications');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  activeNav === 'notifications'
                    ? 'bg-[#52796F] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </button>
              <button
                onClick={() => {
                  setActiveNav('reports');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  activeNav === 'reports'
                    ? 'bg-[#52796F] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports & Analytics</span>
              </button>
            </div>

            {/* Account */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#A3B899]">
                Account & Governance
              </div>
              <button
                onClick={() => {
                  setActiveNav('staff_mgmt');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  activeNav === 'staff_mgmt'
                    ? 'bg-[#52796F] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Staff Management</span>
              </button>
              <button
                onClick={() => {
                  setActiveNav('settings');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                  activeNav === 'settings'
                    ? 'bg-[#52796F] text-white font-semibold'
                    : 'text-slate-300 hover:bg-[#2A3F38] hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </nav>

          {/* User profile & Logout */}
          <div className="p-3 border-t border-[#354F52] bg-[#1A2723] space-y-2">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-[#52796F] text-white flex items-center justify-center font-bold text-xs">
                PS
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">Priya Sharma</div>
                <div className="text-[10px] text-[#A3B899] truncate">{currentUserRole}</div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={onLogout}
                className="w-full py-2 px-3 rounded-lg bg-red-900/40 hover:bg-red-800 text-red-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                title="Logout from OSC session"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{oscProfile.name}</span>
                <span className="hidden sm:inline-block text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Govt Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                District: {oscProfile.district} · State: {oscProfile.state} · 24/7 Helpline: 181
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors"
              title="Logout from staff session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setActiveNav('notifications')}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Section Renderer */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* 1. DASHBOARD */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    OSC Staff Operations Dashboard
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Real-time shelter capacity, active cases, and pending referrals overview.
                  </p>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Last availability update: {new Date(capacity.updatedAt).toLocaleTimeString()}
                </div>
              </div>

              {/* Top 4 KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Capacity & Available Beds */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Shelter Capacity</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#2F453F] font-mono">
                      {capacity.availableBeds}
                    </span>
                    <span className="text-xs text-slate-500">beds available</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    {capacity.occupiedBeds} occupied / {capacity.totalBeds} total
                  </div>
                </div>

                {/* Pending Referrals */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Pending Referrals</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
                      {referrals.filter((r) => r.status === 'New' || r.status === 'Under Review').length}
                    </span>
                    <span className="text-xs text-slate-500">awaiting review</span>
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium pt-1">
                    1 critical referral requires action
                  </div>
                </div>

                {/* Active Ongoing Cases */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Active Support Cases</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                      {cases.filter((c) => c.status !== 'Case Closed').length}
                    </span>
                    <span className="text-xs text-slate-500">in care</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    2 scheduled for follow-up
                  </div>
                </div>

                {/* Completed / Closed Cases */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Completed Cases</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                      {cases.filter((c) => c.status === 'Case Closed').length + 42}
                    </span>
                    <span className="text-xs text-slate-500">rehabilitated</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium pt-1">
                    Zero relapse rate this month
                  </div>
                </div>
              </div>

              {/* Occupancy & Live Capacity Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Occupancy Bar */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Live Accommodation Occupancy
                      </h3>
                      <p className="text-xs text-slate-500">
                        Formula: Available beds A = T - O - U (Total - Occupied - Unavailable)
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveNav('shelter_capacity')}
                      className="text-xs font-semibold text-[#3E5C54] hover:underline"
                    >
                      Manage Beds →
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Occupancy: {capacity.occupancyRate}%</span>
                      <span>Target safety reserve: 20%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-[#3E5C54] h-full transition-all"
                        style={{ width: `${(capacity.occupiedBeds / capacity.totalBeds) * 100}%` }}
                        title="Occupied"
                      />
                      <div
                        className="bg-amber-400 h-full transition-all"
                        style={{ width: `${(capacity.unavailableBeds / capacity.totalBeds) * 100}%` }}
                        title="Unavailable"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3E5C54]" />
                        <span>Occupied: {capacity.occupiedBeds}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        <span>Available: {capacity.availableBeds}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span>Unavailable / Maint: {capacity.unavailableBeds}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick atomic admission / discharge triggers */}
                  <div className="p-4 bg-[#F4F7F4] rounded-xl border border-[#D0DDD0] flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#2F453F]">
                      Quick Operational Adjustment (Atomic Update):
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateCapacity(1)}
                        className="px-3 py-1.5 bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-semibold rounded-lg shadow-xs"
                      >
                        + Record Admission
                      </button>
                      <button
                        onClick={() => handleUpdateCapacity(-1)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg"
                      >
                        - Record Discharge
                      </button>
                    </div>
                  </div>
                </div>

                {/* Service Availability Snapshot */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">Service Status</h3>
                    <button
                      onClick={() => setActiveNav('service_availability')}
                      className="text-xs font-semibold text-[#3E5C54] hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {services.slice(0, 5).map((srv) => (
                      <div
                        key={srv._id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                      >
                        <span className="font-medium text-slate-800">{srv.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            srv.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : srv.status === 'Limited'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {srv.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Recent Referrals Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Recent Referrals</h3>
                    <p className="text-xs text-slate-500">
                      Sensitive identity info is masked in compliance with victim data protocols.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav('referrals')}
                    className="text-xs font-semibold text-[#3E5C54] hover:underline"
                  >
                    View Referral Queue →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-5">Referral ID</th>
                        <th className="p-3.5">Referring Authority</th>
                        <th className="p-3.5">Required Services</th>
                        <th className="p-3.5">Priority</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 pr-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {referrals.slice(0, 4).map((ref) => (
                        <tr key={ref._id} className="hover:bg-slate-50">
                          <td className="p-3.5 pl-5 font-mono font-bold text-[#2F453F]">
                            {ref.referralCode}
                          </td>
                          <td className="p-3.5 text-slate-700">{ref.referringAuthority}</td>
                          <td className="p-3.5 text-slate-600">
                            {ref.requirements.requiredServices.join(', ')}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ref.priority === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : ref.priority === 'urgent'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ref.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium">{ref.status}</td>
                          <td className="p-3.5 pr-5 text-right">
                            <button
                              onClick={() => {
                                setSelectedReferral(ref);
                                setActiveNav('referrals');
                              }}
                              className="px-2.5 py-1 rounded bg-[#E6ECE5] text-[#2F453F] hover:bg-[#D0DDD0] font-semibold text-[11px]"
                            >
                              Review Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 2. OSC PROFILE */}
          {activeNav === 'osc_profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">OSC Centre Profile & Official Information</h2>
                  <p className="text-xs text-slate-500">Maintain official centre registration, coordinates, and operating hours.</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Government Verification Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 font-semibold uppercase">Official Centre Name</label>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{oscProfile.name}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-semibold uppercase">Centre Code (MWCD Identifier)</label>
                    <div className="font-mono font-bold text-[#3E5C54] text-sm mt-0.5">{oscProfile.centreCode}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-semibold uppercase">Official Physical Address</label>
                    <div className="text-slate-800 mt-0.5">{oscProfile.address}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-semibold uppercase">Operating Hours</label>
                    <div className="text-slate-800 font-medium mt-0.5">{oscProfile.operatingHours}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 font-semibold uppercase">Toll-Free & Direct Landline</label>
                    <div className="text-slate-900 font-bold text-sm mt-0.5">{oscProfile.contact.helpline}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-semibold uppercase">Designated Government Email</label>
                    <div className="text-slate-800 font-mono mt-0.5">{oscProfile.contact.email}</div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-semibold uppercase">Geographical Coordinates</label>
                    <div className="text-slate-800 font-mono mt-0.5">
                      Lat: {oscProfile.coordinates.lat}, Lng: {oscProfile.coordinates.lng} (Verified Map Node)
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-semibold uppercase">Assigned Staff Personnel</label>
                    <div className="text-slate-900 font-bold mt-0.5">{oscProfile.assignedStaffCount} Personnel</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F4F7F4] rounded-xl border border-[#D0DDD0] text-xs text-[#2F453F] flex items-center justify-between">
                <span>Manager Notice: Contact or location modifications require approval from the District Magistrate / MWCD auditor.</span>
                <button
                  onClick={() => alert('Request to modify centre profile submitted to District Collectorate.')}
                  className="px-3 py-1.5 bg-[#3E5C54] hover:bg-[#2F453F] text-white font-semibold rounded-lg shrink-0"
                >
                  Request Profile Edit
                </button>
              </div>
            </div>
          )}

          {/* 3. SHELTER CAPACITY */}
          {activeNav === 'shelter_capacity' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Shelter Capacity Management</h2>
                    <p className="text-xs text-slate-500">
                      Live accommodation availability calculation: <strong>A = T - O - U</strong>
                    </p>
                  </div>
                  <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {capacity.lastVerifiedFreshness}
                  </div>
                </div>

                {/* Mathematical Formula breakdown cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Total Registered (T)</span>
                    <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{capacity.totalBeds}</div>
                    <span className="text-[10px] text-slate-400">Sanctioned Beds</span>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-xs font-semibold text-blue-800 uppercase">Occupied Beds (O)</span>
                    <div className="text-3xl font-extrabold text-blue-900 font-mono mt-1">{capacity.occupiedBeds}</div>
                    <span className="text-[10px] text-blue-700">Admitted Beneficiaries</span>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-xs font-semibold text-amber-800 uppercase">Unavailable Beds (U)</span>
                    <div className="text-3xl font-extrabold text-amber-900 font-mono mt-1">{capacity.unavailableBeds}</div>
                    <span className="text-[10px] text-amber-700">Maintenance / Sanitation</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs font-semibold text-emerald-800 uppercase">Available Beds (A)</span>
                    <div className="text-3xl font-extrabold text-emerald-900 font-mono mt-1">{capacity.availableBeds}</div>
                    <span className="text-[10px] text-emerald-700">Ready for Immediate Admission</span>
                  </div>
                </div>

                {/* Operations strip */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-600">
                    Occupancy Rate: <strong>{capacity.occupancyRate}%</strong> · Changes are automatically logged and synchronized with authorized state responders.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateCapacity(1)}
                      className="px-4 py-2 bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Record Admission (+1)
                    </button>
                    <button
                      onClick={() => handleUpdateCapacity(-1)}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl"
                    >
                      Record Discharge (-1)
                    </button>
                  </div>
                </div>
              </div>

              {/* Capacity Change Audit History (MongoDB capacityLogs) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base">Capacity Audit Log (Atomic History)</h3>
                  <p className="text-xs text-slate-500">Every capacity modification is timestamped and auditable.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-5">Timestamp</th>
                        <th className="p-3.5">Action Reason</th>
                        <th className="p-3.5">Previous (T / O / U / A)</th>
                        <th className="p-3.5">New Values (T / O / U / A)</th>
                        <th className="p-3.5 pr-5">Logged By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {capacityLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50">
                          <td className="p-3.5 pl-5 font-mono text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800 uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                              {log.reason}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">
                            {log.previousValues.totalBeds} / {log.previousValues.occupiedBeds} / {log.previousValues.unavailableBeds} / {log.previousValues.availableBeds}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-[#2F453F]">
                            {log.newValues.totalBeds} / {log.newValues.occupiedBeds} / {log.newValues.unavailableBeds} / {log.newValues.availableBeds}
                          </td>
                          <td className="p-3.5 pr-5 text-slate-700">{log.changedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. SERVICE AVAILABILITY */}
          {activeNav === 'service_availability' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Service Availability Management</h2>
                  <p className="text-xs text-slate-500">
                    Maintain status of services offered so referring responders route victims to suitable centres.
                  </p>
                </div>
                <span className="text-xs text-slate-500">Click any service to toggle Available / Limited / Unavailable</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv._id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#3E5C54] transition-all bg-[#FAF9F5] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{srv.title}</h3>
                      <button
                        onClick={() => handleToggleService(srv._id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                          srv.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : srv.status === 'Limited'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {srv.status}
                      </button>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div><strong>Hours:</strong> {srv.operatingHours}</div>
                      <div><strong>Notes:</strong> {srv.additionalNotes}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
                      <span>Updated by: {srv.updatedBy}</span>
                      <span>{new Date(srv.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. REFERRAL MANAGEMENT */}
          {activeNav === 'referrals' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Referral Management</h2>
                  <p className="text-xs text-slate-500">
                    Process referrals from 181, 112, Police liaison, and hospital responders.
                  </p>
                </div>

                {/* Filter tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {['All', 'New', 'Under Review', 'Accepted', 'Arrival Confirmed'].map((filterTab) => (
                    <button
                      key={filterTab}
                      onClick={() => setReferralFilter(filterTab)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        referralFilter === filterTab
                          ? 'bg-[#3E5C54] text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {filterTab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Referrals Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-5">Referral ID</th>
                        <th className="p-3.5">Time</th>
                        <th className="p-3.5">Referring Authority</th>
                        <th className="p-3.5">Required Support</th>
                        <th className="p-3.5">Accommodation</th>
                        <th className="p-3.5">Priority</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 pr-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {referrals
                        .filter((r) => (referralFilter === 'All' ? true : r.status === referralFilter))
                        .map((ref) => (
                          <tr key={ref._id} className="hover:bg-slate-50">
                            <td className="p-3.5 pl-5 font-mono font-bold text-[#2F453F]">
                              {ref.referralCode}
                            </td>
                            <td className="p-3.5 text-slate-500 font-mono">
                              {new Date(ref.requestDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3.5 font-medium text-slate-900">{ref.referringAuthority}</td>
                            <td className="p-3.5 text-slate-600">{ref.requirements.requiredServices.join(', ')}</td>
                            <td className="p-3.5">
                              {ref.requirements.accommodationNeeded ? (
                                <span className="text-emerald-700 font-semibold">Yes ({ref.requirements.accompanyingMinors} minor)</span>
                              ) : (
                                <span className="text-slate-400">No</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  ref.priority === 'critical'
                                    ? 'bg-red-100 text-red-800'
                                    : ref.priority === 'urgent'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {ref.priority.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3.5 font-semibold text-slate-800">{ref.status}</td>
                            <td className="p-3.5 pr-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {ref.status === 'New' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateReferralStatus(ref._id, 'Accepted')}
                                      className="px-2.5 py-1 rounded bg-[#3E5C54] hover:bg-[#2F453F] text-white font-semibold text-[11px]"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleUpdateReferralStatus(ref._id, 'Under Review')}
                                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                                    >
                                      Review
                                    </button>
                                  </>
                                )}
                                {ref.status === 'Accepted' && (
                                  <button
                                    onClick={() => handleUpdateReferralStatus(ref._id, 'Arrival Confirmed')}
                                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                                  >
                                    Confirm Arrival
                                  </button>
                                )}
                                {ref.status === 'Arrival Confirmed' && (
                                  <span className="text-[11px] text-emerald-800 font-medium">Ready for Intake</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 6. CASE COORDINATION */}
          {activeNav === 'cases' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Case Coordination & Lifecycle</h2>
                  <p className="text-xs text-slate-500">
                    6-stage lifecycle: Referral accepted → Admission → Services → Follow-up → Discharge → Case closed.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cases List (Left 1 Col) */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                    Ongoing Support Cases ({cases.length})
                  </div>
                  {cases.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => setSelectedCase(c)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedCase?._id === c._id
                          ? 'bg-[#F4F7F4] border-[#3E5C54] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[#2F453F]">{c.caseCode}</span>
                        <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                          {c.status}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 text-xs mt-1.5">{c.beneficiaryAlias}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Assigned: {c.assignedStaffName}</div>
                    </div>
                  ))}
                </div>

                {/* Case Detail & Restricted Notes (Right 2 Cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
                  {selectedCase ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-base text-[#2F453F]">
                              {selectedCase.caseCode}
                            </span>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {selectedCase.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {selectedCase.beneficiaryAlias} · Age: {selectedCase.age} · Intake: {new Date(selectedCase.intakeDate).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Lifecycle transition buttons */}
                        <div className="flex items-center gap-2">
                          {selectedCase.status === 'Admission Initiated' && (
                            <button
                              onClick={() => handleUpdateCaseStatus(selectedCase._id, 'Services in Progress')}
                              className="px-3 py-1.5 bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-semibold rounded-lg"
                            >
                              Commence Services
                            </button>
                          )}
                          {selectedCase.status === 'Services in Progress' && (
                            <button
                              onClick={() => handleUpdateCaseStatus(selectedCase._id, 'Follow-up Scheduled')}
                              className="px-3 py-1.5 bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-semibold rounded-lg"
                            >
                              Schedule Follow-up
                            </button>
                          )}
                          {selectedCase.status === 'Follow-up Scheduled' && (
                            <button
                              onClick={() => handleUpdateCaseStatus(selectedCase._id, 'Case Closed')}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
                            >
                              Close Case
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Services provided */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Active Support Package</label>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCase.servicesProvided.map((srv: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-[#F4F7F4] text-[#2F453F] border border-[#D0DDD0] rounded-lg text-xs font-medium">
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Restricted Internal Case Notes */}
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Restricted Case Notes (Confidential)</span>
                          </label>
                          <span className="text-[10px] text-slate-400">Restricted to OSC case team</span>
                        </div>

                        <div className="space-y-2.5 max-h-48 overflow-y-auto">
                          {caseNotes
                            .filter((n) => n.caseId === selectedCase._id)
                            .map((note) => (
                              <div key={note._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between text-slate-500 text-[10px]">
                                  <span className="font-bold text-slate-700">{note.authorName} ({note.authorRole})</span>
                                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-slate-800 leading-relaxed">{note.encryptedContent}</p>
                              </div>
                            ))}
                        </div>

                        {/* Add note input */}
                        <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Add encrypted case note..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-semibold rounded-xl"
                          >
                            Add Note
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Select a case from the left panel to inspect details and case notes.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* 7. NOTIFICATIONS */}
          {activeNav === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Operational Notifications (Socket.IO Real-Time)</h2>
                <button
                  onClick={handleMarkAllNotifications}
                  className="text-xs font-semibold text-[#3E5C54] hover:underline"
                >
                  Mark All Read
                </button>
              </div>

              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      !n.readAt ? 'bg-[#F4F7F4] border-[#D0DDD0]' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#52796F] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-800 font-medium">{n.message}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString()} · Event: {n.type}
                        </span>
                      </div>
                    </div>
                    {!n.readAt && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. REPORTS & ANALYTICS */}
          {activeNav === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Centre Performance & Analytics</h2>
                  <p className="text-xs text-slate-500">Review live occupancy trends, referral response times, and monthly reports.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report (CSV)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-semibold uppercase">Average Referral Response Time</div>
                  <div className="text-2xl font-bold font-mono text-slate-900">{analyticsReport.averageResponseMinutes} min</div>
                  <div className="text-[11px] text-emerald-700">Live operational standard</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-semibold uppercase">Referral Acceptance Rate</div>
                  <div className="text-2xl font-bold font-mono text-emerald-700">{analyticsReport.acceptanceRate}%</div>
                  <div className="text-[11px] text-slate-500">{analyticsReport.acceptedReferrals} of {analyticsReport.totalReferrals} referrals accepted</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-semibold uppercase">30-Day Shelter Utilization</div>
                  <div className="text-2xl font-bold font-mono text-slate-900">{analyticsReport.shelterUtilization}%</div>
                  <div className="text-[11px] text-slate-500">{capacity.occupiedBeds} of {capacity.totalBeds} total beds occupied</div>
                </div>
              </div>
            </div>
          )}

          {/* 9. STAFF MANAGEMENT (Manager Role) */}
          {activeNav === 'staff_mgmt' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Staff Management (Manager Only)</h2>
                  <p className="text-xs text-slate-500">Manage assigned staff accounts and active roles in MongoDB.</p>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-3.5 py-1.5 bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  + Add Staff Account
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 pl-4">Staff Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Designation / Role</th>
                      <th className="p-3">Badge ID</th>
                      <th className="p-3 pr-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.map((st) => (
                      <tr key={st._id} className="hover:bg-slate-50">
                        <td className="p-3 pl-4 font-bold text-slate-900">{st.name}</td>
                        <td className="p-3 font-mono text-slate-600">{st.email}</td>
                        <td className="p-3 font-semibold text-[#3E5C54]">
                          {st.role.replace('_', ' ').toUpperCase()}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{st.badgeId}</td>
                        <td className="p-3 pr-4 text-right">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. SETTINGS */}
          {activeNav === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Portal Security & Session Settings</h2>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">Session Security (JWT Token Lifetime)</div>
                  <p className="text-slate-500">Auto session termination is set to 8 hours of inactivity to prevent unauthorized terminal access.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">Audit Logging</div>
                  <p className="text-slate-500">All capacity changes and case notes are immutable in MongoDB auditLogs collection.</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Add Staff Account Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Staff Account</h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Dr. Kavitha Reddy"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Government Email</label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="name@sakhi.gov.in"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role / Designation</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-white"
                  >
                    <option value="case_manager">Case Manager</option>
                    <option value="counsellor">Psychosocial Counsellor</option>
                    <option value="medical_officer">Medical Officer</option>
                    <option value="centre_manager">Centre Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge ID</label>
                  <input
                    type="text"
                    value={newStaffBadge}
                    onChange={(e) => setNewStaffBadge(e.target.value)}
                    placeholder="OSC-BLR-09"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Phone</label>
                <input
                  type="tel"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3E5C54] hover:bg-[#2F453F] text-white font-bold rounded-xl shadow-xs"
                >
                  Save to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
