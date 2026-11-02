import {
  UserModel,
  OSCModel,
  CapacityModel,
  CapacityLogModel,
  ServiceModel,
  ReferralModel,
  CaseModel,
  CaseNoteModel,
  FollowUpModel,
  NotificationModel,
  AssistanceRequestModel,
  CommunicationModel,
  RequestEventModel,
  AuditLogModel
} from '../models';
import { isFallbackActive } from './connection';
import { getSeedData } from './seedData';

// In-Memory fallback store
let memStore: any = {
  users: [],
  oscs: [],
  capacity: [],
  capacityLogs: [],
  services: [],
  referrals: [],
  cases: [],
  caseNotes: [],
  followUps: [],
  notifications: [],
  assistanceRequests: [],
  communications: [],
  requestEvents: [],
  auditLogs: []
};

let isSeeded = false;

export async function initializeDatabase() {
  if (isSeeded) return;
  const seeds = await getSeedData();

  if (isFallbackActive()) {
    memStore.users = seeds.users;
    memStore.oscs = seeds.oscs;
    memStore.capacity = seeds.capacity;
    memStore.services = seeds.services;
    memStore.referrals = seeds.referrals;
    memStore.cases = seeds.cases;
    memStore.caseNotes = seeds.caseNotes;
    memStore.followUps = seeds.followUps;
    memStore.notifications = seeds.notifications;
    isSeeded = true;
    console.log('[Store] Resilient persistence engine initialized with seed records.');
    return;
  }

  try {
    // Check if MongoDB collection is empty, if so, seed it
    const oscCount = await OSCModel.countDocuments();
    if (oscCount === 0) {
      await OSCModel.insertMany(seeds.oscs as any);
      await UserModel.insertMany(seeds.users as any);
      await CapacityModel.insertMany(seeds.capacity as any);
      await ServiceModel.insertMany(seeds.services as any);
      await ReferralModel.insertMany(seeds.referrals as any);
      await CaseModel.insertMany(seeds.cases as any);
      await CaseNoteModel.insertMany(seeds.caseNotes as any);
      await FollowUpModel.insertMany(seeds.followUps as any);
      await NotificationModel.insertMany(seeds.notifications as any);
      console.log('[MongoDB] Local Community Server seeded with default collections.');
    }
    isSeeded = true;
  } catch (err: any) {
    console.warn('[MongoDB Seed] Seeding error:', err.message);
  }
}

/* ==========================================================================
   USERS REPOSITORY
   ========================================================================== */
export const UserRepository = {
  async findByEmail(email: string) {
    if (isFallbackActive()) {
      return memStore.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    }
    return await UserModel.findOne({ email: email.toLowerCase() }).lean();
  },

  async findById(id: string) {
    if (isFallbackActive()) {
      return memStore.users.find((u: any) => u._id === id);
    }
    return await UserModel.findById(id).lean();
  },

  async create(userData: any) {
    if (isFallbackActive()) {
      const newUser = {
        _id: userData._id || 'usr-' + Date.now(),
        ...userData,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memStore.users.push(newUser);
      return newUser;
    }
    return await UserModel.create(userData);
  },

  async getAllByOSC(oscId: string) {
    if (isFallbackActive()) {
      return memStore.users.filter((u: any) => !oscId || u.oscId === oscId);
    }
    return await UserModel.find(oscId ? { oscId } : {}).lean();
  }
};

/* ==========================================================================
   OSC REPOSITORY
   ========================================================================== */
export const OSCRepository = {
  async getAll() {
    if (isFallbackActive()) {
      return memStore.oscs;
    }
    return await OSCModel.find().lean();
  },

  async getById(id: string) {
    if (isFallbackActive()) {
      return memStore.oscs.find((o: any) => o._id === id || o.centreCode === id.toUpperCase());
    }
    return await OSCModel.findOne({ $or: [{ _id: id }, { centreCode: id.toUpperCase() }] }).lean();
  },

  async update(id: string, updateData: any) {
    if (isFallbackActive()) {
      const idx = memStore.oscs.findIndex((o: any) => o._id === id || o.centreCode === id.toUpperCase());
      if (idx !== -1) {
        memStore.oscs[idx] = { ...memStore.oscs[idx], ...updateData, updatedAt: new Date() };
        return memStore.oscs[idx];
      }
      return null;
    }
    return await OSCModel.findOneAndUpdate({ $or: [{ _id: id }, { centreCode: id.toUpperCase() }] }, updateData, { new: true }).lean();
  }
};

/* ==========================================================================
   CAPACITY REPOSITORY (ATOMIC OPERATIONS)
   ========================================================================== */
export const CapacityRepository = {
  async getByOSC(oscId: string) {
    if (isFallbackActive()) {
      let cap = memStore.capacity.find((c: any) => c.oscId === oscId);
      if (!cap && memStore.capacity.length > 0) cap = memStore.capacity[0];
      return cap;
    }
    return await CapacityModel.findOne({ oscId }).lean();
  },

  async updateCapacity(oscId: string, action: 'admission' | 'discharge' | 'maintenance', delta: number, changedBy: string) {
    const cap = await this.getByOSC(oscId);
    if (!cap) throw new Error('OSC Capacity profile not found.');

    const previousValues = {
      totalBeds: cap.totalBeds,
      occupiedBeds: cap.occupiedBeds,
      reservedBeds: cap.reservedBeds || 0,
      availableBeds: cap.availableBeds
    };

    let newOccupied = cap.occupiedBeds;
    let newUnavailable = cap.unavailableBeds || 0;

    if (action === 'admission') {
      newOccupied += delta;
    } else if (action === 'discharge') {
      newOccupied = Math.max(0, newOccupied - delta);
    } else if (action === 'maintenance') {
      newUnavailable += delta;
    }

    if (newOccupied + (cap.reservedBeds || 0) + newUnavailable > cap.totalBeds) {
      throw new Error(`Capacity limit reached. Total beds: ${cap.totalBeds}, Occupied + Unavailable: ${newOccupied + newUnavailable}`);
    }

    const newAvailable = Math.max(0, cap.totalBeds - newOccupied - (cap.reservedBeds || 0) - newUnavailable);
    const occupancyRate = Number(((newOccupied / cap.totalBeds) * 100).toFixed(1));

    const updated = {
      ...cap,
      occupiedBeds: newOccupied,
      unavailableBeds: newUnavailable,
      availableBeds: newAvailable,
      occupancyRate,
      lastVerifiedAt: new Date(),
      updatedBy: changedBy
    };

    const logEntry = {
      _id: 'log-' + Date.now(),
      oscId,
      previousValues,
      newValues: {
        totalBeds: updated.totalBeds,
        occupiedBeds: updated.occupiedBeds,
        reservedBeds: updated.reservedBeds || 0,
        availableBeds: updated.availableBeds
      },
      reason: action,
      delta,
      changedBy,
      timestamp: new Date()
    };

    if (isFallbackActive()) {
      const idx = memStore.capacity.findIndex((c: any) => c.oscId === oscId);
      if (idx !== -1) memStore.capacity[idx] = updated;
      else memStore.capacity.push(updated);
      memStore.capacityLogs.unshift(logEntry);
      return { capacity: updated, log: logEntry };
    }

    const savedCap = await CapacityModel.findOneAndUpdate({ oscId }, updated, { new: true, upsert: true }).lean();
    await CapacityLogModel.create(logEntry);
    return { capacity: savedCap, log: logEntry };
  },

  async getLogs(oscId: string) {
    if (isFallbackActive()) {
      return memStore.capacityLogs.filter((l: any) => !oscId || l.oscId === oscId);
    }
    return await CapacityLogModel.find(oscId ? { oscId } : {}).sort({ timestamp: -1 }).limit(50).lean();
  }
};

/* ==========================================================================
   SERVICES REPOSITORY
   ========================================================================== */
export const ServiceRepository = {
  async getByOSC(oscId?: string) {
    if (isFallbackActive()) {
      return oscId ? memStore.services.filter((s: any) => s.oscId === oscId) : memStore.services;
    }
    return await ServiceModel.find(oscId ? { oscId } : {}).lean();
  },

  async updateStatus(id: string, status: string, updatedBy: string, notes?: string) {
    if (isFallbackActive()) {
      const item = memStore.services.find((s: any) => s._id === id);
      if (item) {
        item.status = status;
        item.updatedBy = updatedBy;
        if (notes) item.notes = notes;
        item.lastUpdated = new Date();
        return item;
      }
      return null;
    }
    return await ServiceModel.findByIdAndUpdate(id, {
      status,
      updatedBy,
      notes,
      lastUpdated: new Date()
    }, { new: true }).lean();
  }
};

/* ==========================================================================
   REFERRALS REPOSITORY
   ========================================================================== */
export const ReferralRepository = {
  async getAll(oscId?: string) {
    if (isFallbackActive()) {
      return oscId ? memStore.referrals.filter((r: any) => r.oscId === oscId) : memStore.referrals;
    }
    return await ReferralModel.find(oscId ? { oscId } : {}).sort({ createdAt: -1 }).lean();
  },

  async getByReference(reference: string) {
    if (isFallbackActive()) {
      return memStore.referrals.find((r: any) => r.requestReference === reference || r.referralCode === reference);
    }
    return await ReferralModel.findOne({ $or: [{ requestReference: reference }, { referralCode: reference }] }).lean();
  },

  async create(data: any) {
    if (isFallbackActive()) {
      const newRef = {
        _id: 'ref-' + Date.now(),
        referralCode: data.referralCode || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'New',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      memStore.referrals.unshift(newRef);
      return newRef;
    }
    return await ReferralModel.create(data);
  },

  async updateStatus(id: string, status: string, extra?: { rejectionReason?: string; assignedStaffName?: string; notes?: string }) {
    if (isFallbackActive()) {
      const ref = memStore.referrals.find((r: any) => r._id === id || r.referralCode === id);
      if (ref) {
        ref.status = status;
        ref.updatedAt = new Date();
        if (extra?.rejectionReason) ref.rejectionReason = extra.rejectionReason;
        if (extra?.assignedStaffName) ref.assignedStaffName = extra.assignedStaffName;
        if (extra?.notes) ref.notes = extra.notes;
        return ref;
      }
      return null;
    }
    return await ReferralModel.findOneAndUpdate(
      { $or: [{ _id: id }, { referralCode: id }] },
      { status, ...extra, updatedAt: new Date() },
      { new: true }
    ).lean();
  }
};

/* ==========================================================================
   CASES & NOTES REPOSITORY
   ========================================================================== */
export const CaseRepository = {
  async getAll(oscId?: string) {
    if (isFallbackActive()) {
      return oscId ? memStore.cases.filter((c: any) => c.oscId === oscId) : memStore.cases;
    }
    return await CaseModel.find(oscId ? { oscId } : {}).sort({ intakeDate: -1 }).lean();
  },

  async updateStatus(id: string, status: string) {
    if (isFallbackActive()) {
      const c = memStore.cases.find((item: any) => item._id === id || item.caseNumber === id);
      if (c) {
        c.status = status;
        c.updatedAt = new Date();
        return c;
      }
      return null;
    }
    return await CaseModel.findOneAndUpdate({ $or: [{ _id: id }, { caseNumber: id }] }, { status, updatedAt: new Date() }, { new: true }).lean();
  },

  async getNotes(caseId: string) {
    if (isFallbackActive()) {
      return memStore.caseNotes.filter((cn: any) => cn.caseId === caseId);
    }
    return await CaseNoteModel.find({ caseId }).sort({ createdAt: -1 }).lean();
  },

  async addNote(noteData: any) {
    if (isFallbackActive()) {
      const note = {
        _id: 'cn-' + Date.now(),
        createdAt: new Date(),
        isRestricted: true,
        ...noteData
      };
      memStore.caseNotes.unshift(note);
      return note;
    }
    return await CaseNoteModel.create(noteData);
  }
};

/* ==========================================================================
   ASSISTANCE REQUESTS REPOSITORY (VICTIM PORTAL)
   ========================================================================== */
export const AssistanceRequestRepository = {
  async create(payload: any) {
    const reference = `REQ-KA-${Date.now().toString().slice(-6)}`;
    const trackingToken = `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = {
      _id: 'req-' + Date.now(),
      requestReference: reference,
      trackingToken,
      status: 'submitted',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...payload
    };

    if (isFallbackActive()) {
      memStore.assistanceRequests.unshift(newRequest);
      // Create initial timeline event
      memStore.requestEvents.push({
        _id: 'evt-' + Date.now(),
        requestReference: reference,
        eventStage: 'Submitted',
        title: 'Request Intake Registered',
        description: 'Assistance request received securely with high-priority confidential routing.',
        performedBy: 'Victim Intake Protocol',
        timestamp: new Date()
      });
      return newRequest;
    }

    const created = await AssistanceRequestModel.create(newRequest);
    await RequestEventModel.create({
      requestReference: reference,
      eventStage: 'Submitted',
      title: 'Request Intake Registered',
      description: 'Assistance request received securely with high-priority confidential routing.',
      performedBy: 'Victim Intake Protocol',
      timestamp: new Date()
    });
    return created;
  },

  async getByReference(reference: string) {
    if (isFallbackActive()) {
      return memStore.assistanceRequests.find((r: any) => r.requestReference === reference || r.trackingToken === reference);
    }
    return await AssistanceRequestModel.findOne({ $or: [{ requestReference: reference }, { trackingToken: reference }] }).lean();
  },

  async updateStatus(reference: string, status: string, extra?: any) {
    if (isFallbackActive()) {
      const req = memStore.assistanceRequests.find((r: any) => r.requestReference === reference || r.trackingToken === reference);
      if (req) {
        req.status = status;
        req.updatedAt = new Date();
        if (extra) Object.assign(req, extra);
        return req;
      }
      return null;
    }
    return await AssistanceRequestModel.findOneAndUpdate(
      { $or: [{ requestReference: reference }, { trackingToken: reference }] },
      { status, ...extra, updatedAt: new Date() },
      { new: true }
    ).lean();
  },

  async getEvents(reference: string) {
    if (isFallbackActive()) {
      return memStore.requestEvents.filter((e: any) => e.requestReference === reference).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    return await RequestEventModel.find({ requestReference: reference }).sort({ timestamp: 1 }).lean();
  },

  async addEvent(eventData: any) {
    if (isFallbackActive()) {
      const evt = {
        _id: 'evt-' + Date.now(),
        timestamp: new Date(),
        ...eventData
      };
      memStore.requestEvents.push(evt);
      return evt;
    }
    return await RequestEventModel.create(eventData);
  }
};

/* ==========================================================================
   COMMUNICATIONS / MESSAGING REPOSITORY (SCREEN 7)
   ========================================================================== */
export const CommunicationRepository = {
  async getMessages(conversationId: string) {
    if (isFallbackActive()) {
      return memStore.communications.filter((m: any) => m.conversationId === conversationId).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return await CommunicationModel.find({ conversationId }).sort({ createdAt: 1 }).lean();
  },

  async sendMessage(data: any) {
    const newMsg = {
      _id: 'msg-' + Date.now(),
      createdAt: new Date(),
      ...data
    };

    if (isFallbackActive()) {
      memStore.communications.push(newMsg);
      return newMsg;
    }
    return await CommunicationModel.create(newMsg);
  }
};

/* ==========================================================================
   NOTIFICATIONS REPOSITORY (SCREEN 8 & STAFF)
   ========================================================================== */
export const NotificationRepository = {
  async getForRecipient(recipientId: string) {
    if (isFallbackActive()) {
      return memStore.notifications.filter((n: any) => !recipientId || n.recipientId === recipientId || n.recipientType === 'centre').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return await NotificationModel.find({ $or: [{ recipientId }, { recipientType: 'centre' }] }).sort({ createdAt: -1 }).lean();
  },

  async create(data: any) {
    const notif = {
      _id: 'notif-' + Date.now(),
      createdAt: new Date(),
      ...data
    };

    if (isFallbackActive()) {
      memStore.notifications.unshift(notif);
      return notif;
    }
    return await NotificationModel.create(notif);
  },

  async markAllRead(recipientId: string) {
    const now = new Date();
    if (isFallbackActive()) {
      memStore.notifications.forEach((n: any) => {
        if (!recipientId || n.recipientId === recipientId || n.recipientType === 'centre') {
          n.readAt = now;
        }
      });
      return true;
    }
    await NotificationModel.updateMany({ $or: [{ recipientId }, { recipientType: 'centre' }], readAt: null }, { readAt: now });
    return true;
  }
};
