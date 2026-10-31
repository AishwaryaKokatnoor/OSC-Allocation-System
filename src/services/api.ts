/**
 * SakhiLink API Client
 * Connects frontend UI to Express backend REST APIs and MongoDB collections
 */

const API_BASE = '/api';

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
  async login(email: string, role?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: login', err);
      return null;
    }
  },

  // Shelter Capacity: Fetch & Update
  async getCapacity() {
    try {
      const res = await fetch(`${API_BASE}/capacity`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateCapacity(action: 'admission' | 'discharge' | 'maintenance', delta: number = 1) {
    try {
      const res = await fetch(`${API_BASE}/capacity/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, delta })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: updateCapacity', err);
      return null;
    }
  },

  // Services: Fetch & Status Toggle
  async getServices() {
    try {
      const res = await fetch(`${API_BASE}/services`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateServiceStatus(id: string, status: string, notes?: string) {
    try {
      const res = await fetch(`${API_BASE}/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`${API_BASE}/referrals`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateReferralStatus(id: string, status: string) {
    try {
      const res = await fetch(`${API_BASE}/referrals/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
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
      const res = await fetch(`${API_BASE}/cases`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async addCaseNote(caseId: string, encryptedContent: string) {
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedContent })
      });
      return await res.json();
    } catch (err) {
      console.error('API Error: addCaseNote', err);
      return null;
    }
  },

  // Screen 2: Victim Emergency Assistance Request
  async submitEmergencyRequest(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/victim/emergency-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit emergency request.');
      }
      return data;
    } catch (err: any) {
      console.error('API Error: submitEmergencyRequest', err);
      throw err;
    }
  },

  async getEmergencyRequest(requestId: string) {
    try {
      const res = await fetch(`${API_BASE}/victim/emergency-request/${requestId}`);
      if (!res.ok) throw new Error('Request not found');
      return await res.json();
    } catch (err: any) {
      console.error('API Error: getEmergencyRequest', err);
      throw err;
    }
  },

  // Screen 3: General Assistance Request
  async submitGeneralRequest(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/victim/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit assistance request.');
      }
      return data;
    } catch (err: any) {
      console.error('API Error: submitGeneralRequest', err);
      throw err;
    }
  },

  async getGeneralRequest(reference: string, token?: string) {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['x-tracking-token'] = token;
      const res = await fetch(`${API_BASE}/victim/requests/${reference}`, { headers });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Request not found or unauthorized');
      }
      return await res.json();
    } catch (err: any) {
      console.error('API Error: getGeneralRequest', err);
      throw err;
    }
  },

  // Screen 4: OSC Discovery & Recommendations
  async getOSCs(params?: {
    state?: string;
    district?: string;
    search?: string;
    service?: string;
    shelterAvailability?: string;
    accessibility?: string[];
    maxDistance?: number;
    sortBy?: 'nearest' | 'best_match' | 'availability';
    lat?: number;
    lng?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const query = new URLSearchParams();
      if (params?.state && params.state !== 'All') query.set('state', params.state);
      if (params?.district && params.district !== 'All') query.set('district', params.district);
      if (params?.search) query.set('search', params.search);
      if (params?.service && params.service !== 'all') query.set('service', params.service);
      if (params?.shelterAvailability && params.shelterAvailability !== 'all') {
        query.set('shelterAvailability', params.shelterAvailability);
      }
      if (params?.accessibility && params.accessibility.length > 0) {
        query.set('accessibility', params.accessibility.join(','));
      }
      if (params?.maxDistance) query.set('maxDistance', params.maxDistance.toString());
      if (params?.sortBy) query.set('sortBy', params.sortBy);
      if (params?.lat !== undefined) query.set('lat', params.lat.toString());
      if (params?.lng !== undefined) query.set('lng', params.lng.toString());
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());

      const res = await fetch(`${API_BASE}/victim/oscs?${query.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch One Stop Centres');
      }
      return await res.json();
    } catch (err: any) {
      console.error('API Error: getOSCs', err);
      throw err;
    }
  },

  async getOSCById(id: string) {
    try {
      const res = await fetch(`${API_BASE}/victim/oscs/${id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'One Stop Centre details not found');
      }
      return await res.json();
    } catch (err: any) {
      console.error('API Error: getOSCById', err);
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

  async getOSCRecommendations(requestId: string, token?: string) {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['x-tracking-token'] = token;
      const res = await fetch(`${API_BASE}/victim/requests/${requestId}/recommendations`, { headers });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate recommendations');
      }
      return await res.json();
    } catch (err: any) {
      console.error('API Error: getOSCRecommendations', err);
      throw err;
    }
  }
};


