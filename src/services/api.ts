/**
 * SakhiLink API Client
 * Connects frontend UI to Express backend REST APIs and MongoDB collections
 */

const API_BASE = '/api';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('sakhilink_token', token);
  else localStorage.removeItem('sakhilink_token');
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('sakhilink_token');
  }
  return authToken;
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiClient = {
  // Check backend status
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // Auth: Login
  async login(email: string, password?: string, role?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAuthToken(data.token);
      }
      return data;
    } catch (err) {
      console.error('API Error: login', err);
      return null;
    }
  },

  // Auth: Register Staff
  async registerStaff(staffData: {
    name: string;
    email: string;
    password: string;
    role: string;
    oscId?: string;
    phone?: string;
    badgeId?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/auth/register-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAuthToken(data.token);
      }
      return data;
    } catch (err) {
      console.error('API Error: registerStaff', err);
      return null;
    }
  },

  // Shelter Capacity: Fetch & Update
  async getCapacity() {
    try {
      const res = await fetch(`${API_BASE}/capacity`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateCapacity(action: 'admission' | 'discharge' | 'maintenance', delta: number = 1) {
    try {
      const res = await fetch(`${API_BASE}/capacity/update`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action, delta })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: updateCapacity', err);
      return null;
    }
  },

  async getCapacityLogs() {
    try {
      const res = await fetch(`${API_BASE}/capacity/logs`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return [];
    }
  },

  // Services: Fetch & Status Toggle
  async getServices() {
    try {
      const res = await fetch(`${API_BASE}/services`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateServiceStatus(id: string, status: string, notes?: string) {
    try {
      const res = await fetch(`${API_BASE}/services/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, additionalNotes: notes })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: updateServiceStatus', err);
      return null;
    }
  },

  // Referrals
  async getReferrals() {
    try {
      const res = await fetch(`${API_BASE}/referrals`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateReferralStatus(id: string, status: string, rejectionReason?: string, notes?: string) {
    try {
      const res = await fetch(`${API_BASE}/referrals/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, rejectionReason, notes })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: updateReferralStatus', err);
      return null;
    }
  },

  // Cases & Notes
  async getCases() {
    try {
      const res = await fetch(`${API_BASE}/cases`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateCaseStatus(id: string, status: string) {
    try {
      const res = await fetch(`${API_BASE}/cases/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: updateCaseStatus', err);
      return null;
    }
  },

  async addCaseNote(caseId: string, encryptedContent: string) {
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ encryptedContent })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: addCaseNote', err);
      return null;
    }
  },

  // Staff Notifications
  async getStaffNotifications() {
    try {
      const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return [];
    }
  },

  async markAllNotificationsRead() {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Analytics Reports & CSV Export
  async getAnalyticsReports() {
    try {
      const res = await fetch(`${API_BASE}/reports/analytics`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return null;
    }
  },

  async exportReportCSV() {
    try {
      const res = await fetch(`${API_BASE}/reports/export-csv`, { headers: getHeaders() });
      return await res.text();
    } catch {
      return '';
    }
  },

  // Staff Management
  async getStaffMembers() {
    try {
      const res = await fetch(`${API_BASE}/staff`, { headers: getHeaders() });
      return await res.json();
    } catch {
      return [];
    }
  },

  async createStaffMember(data: any) {
    try {
      const res = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: createStaffMember', err);
      return null;
    }
  },

  // ==========================================
  // VICTIM PORTAL (SCREENS 2 - 9)
  // ==========================================

  // Screen 2: Emergency Request
  async submitEmergencyRequest(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/victim/emergency-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit emergency request.');
      return data;
    } catch (err: any) {
      console.error('API Error: submitEmergencyRequest', err);
      throw err;
    }
  },

  // Screen 3: General Intake Request
  async submitGeneralRequest(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/victim/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit assistance request.');
      return data;
    } catch (err: any) {
      console.error('API Error: submitGeneralRequest', err);
      throw err;
    }
  },

  // Screen 4: OSC Discovery
  async getOSCs(params?: Record<string, any>) {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== 'all' && v !== 'All') {
            query.set(k, Array.isArray(v) ? v.join(',') : v.toString());
          }
        });
      }
      const res = await fetch(`${API_BASE}/victim/oscs?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch One Stop Centres');
      return await res.json();
    } catch (err: any) {
      console.error('API Error: getOSCs', err);
      throw err;
    }
  },

  async getOSCFilters() {
    try {
      const res = await fetch(`${API_BASE}/victim/oscs/filters`);
      if (!res.ok) throw new Error('Failed to fetch discovery filters');
      return await res.json();
    } catch (err: any) {
      console.error('API Error: getOSCFilters', err);
      throw err;
    }
  },

  // Screen 5: Recommended Support
  async getOSCRecommendations(requestId: string, token?: string) {
    try {
      const url = `${API_BASE}/victim/requests/${requestId}/recommendations${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to generate recommendations');
      return await res.json();
    } catch (err: any) {
      console.error('API Error: getOSCRecommendations', err);
      throw err;
    }
  },

  async confirmReferral(requestId: string, oscId: string, notes?: string) {
    try {
      const res = await fetch(`${API_BASE}/victim/requests/${requestId}/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oscId, notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm referral');
      return data;
    } catch (err: any) {
      console.error('API Error: confirmReferral', err);
      throw err;
    }
  },

  // Screen 6: Request Tracking
  async getTrackingDetails(reference: string) {
    try {
      const res = await fetch(`${API_BASE}/victim/requests/${reference}`);
      if (!res.ok) throw new Error('Request tracking details not found');
      return await res.json();
    } catch (err: any) {
      console.error('API Error: getTrackingDetails', err);
      throw err;
    }
  },

  async cancelRequest(reference: string) {
    try {
      const res = await fetch(`${API_BASE}/victim/requests/${reference}/cancel`, {
        method: 'POST'
      });
      return await res.json();
    } catch (err: any) {
      console.error('API Error: cancelRequest', err);
      throw err;
    }
  },

  // Screen 7: In-App Messaging & Callback
  async getMessages(reference: string) {
    try {
      const res = await fetch(`${API_BASE}/victim/communications/${reference}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async sendMessage(reference: string, payload: {
    messageText?: string;
    senderRole?: 'victim' | 'staff';
    senderName?: string;
    isCallbackRequest?: boolean;
    callbackDetails?: any;
  }) {
    try {
      const res = await fetch(`${API_BASE}/victim/communications/${reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: sendMessage', err);
      return null;
    }
  },

  // Screen 8: Victim Notifications
  async getVictimNotifications(reference: string) {
    try {
      const res = await fetch(`${API_BASE}/victim/notifications/${reference}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async markAllVictimNotificationsRead(reference: string) {
    try {
      const res = await fetch(`${API_BASE}/victim/notifications/${reference}/read-all`, {
        method: 'POST'
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Screen 9: Data Deletion Request Workflow
  async requestDataDeletion(reference: string, trackingToken?: string, reason?: string) {
    try {
      const res = await fetch(`${API_BASE}/victim/privacy/data-deletion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestReference: reference, trackingToken, reason })
      });
      return await res.json();
    } catch (err: any) {
      console.error('API Error: requestDataDeletion', err);
      throw err;
    }
  }
};
