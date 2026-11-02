import mongoose, { Schema, Document, Model } from 'mongoose';

/* ==========================================================================
   1. USER SCHEMA & MODEL
   ========================================================================== */
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'centre_manager' | 'case_manager' | 'counsellor' | 'medical_officer' | 'victim';
  oscId?: string;
  phone?: string;
  badgeId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['centre_manager', 'case_manager', 'counsellor', 'medical_officer', 'victim'],
    default: 'case_manager'
  },
  oscId: { type: String, default: 'osc-ka-blr-01' },
  phone: { type: String, trim: true },
  badgeId: { type: String, trim: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ oscId: 1, role: 1 });

/* ==========================================================================
   2. ONE STOP CENTRE (OSC) SCHEMA & MODEL
   ========================================================================== */
export interface IOSC extends Document {
  centreCode: string;
  name: string;
  district: string;
  state: string;
  address: string;
  coordinates: { lat: number; lng: number };
  helpline: string;
  landline: string;
  operatingHours: string;
  verified: boolean;
  servicesOffered: string[];
  accessibilityFeatures: string[];
  intakeCapacity: {
    totalBeds: number;
    currentAvailableBeds: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OSCSchema = new Schema<IOSC>({
  centreCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  helpline: { type: String, default: '181' },
  landline: { type: String, default: '080-22942000' },
  operatingHours: { type: String, default: '24/7 Crisis Response' },
  verified: { type: Boolean, default: true },
  servicesOffered: [{ type: String }],
  accessibilityFeatures: [{ type: String }],
  intakeCapacity: {
    totalBeds: { type: Number, default: 30 },
    currentAvailableBeds: { type: Number, default: 8 }
  }
}, { timestamps: true });

OSCSchema.index({ state: 1, district: 1 });
OSCSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

/* ==========================================================================
   3. CAPACITY SCHEMA & MODEL
   Formula: availableBeds = totalBeds - occupiedBeds - reservedBeds - unavailableBeds
   ========================================================================== */
export interface ICapacity extends Document {
  oscId: string;
  totalBeds: number;
  occupiedBeds: number;
  reservedBeds: number;
  unavailableBeds: number;
  availableBeds: number;
  occupancyRate: number;
  lastVerifiedAt: Date;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const CapacitySchema = new Schema<ICapacity>({
  oscId: { type: String, required: true, unique: true },
  totalBeds: { type: Number, required: true, min: 0 },
  occupiedBeds: { type: Number, required: true, min: 0, default: 0 },
  reservedBeds: { type: Number, required: true, min: 0, default: 0 },
  unavailableBeds: { type: Number, required: true, min: 0, default: 0 },
  availableBeds: { type: Number, required: true, min: 0 },
  occupancyRate: { type: Number, default: 0 },
  lastVerifiedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System' }
}, { timestamps: true });

/* ==========================================================================
   4. CAPACITY LOG SCHEMA & MODEL
   ========================================================================== */
export interface ICapacityLog extends Document {
  oscId: string;
  previousValues: {
    totalBeds: number;
    occupiedBeds: number;
    reservedBeds: number;
    availableBeds: number;
  };
  newValues: {
    totalBeds: number;
    occupiedBeds: number;
    reservedBeds: number;
    availableBeds: number;
  };
  reason: 'admission' | 'discharge' | 'maintenance' | 'reservation' | 'audit_adjustment';
  delta: number;
  changedBy: string;
  timestamp: Date;
}

const CapacityLogSchema = new Schema<ICapacityLog>({
  oscId: { type: String, required: true, index: true },
  previousValues: {
    totalBeds: Number,
    occupiedBeds: Number,
    reservedBeds: Number,
    availableBeds: Number
  },
  newValues: {
    totalBeds: Number,
    occupiedBeds: Number,
    reservedBeds: Number,
    availableBeds: Number
  },
  reason: { 
    type: String, 
    required: true,
    enum: ['admission', 'discharge', 'maintenance', 'reservation', 'audit_adjustment']
  },
  delta: { type: Number, default: 1 },
  changedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

/* ==========================================================================
   5. SERVICE AVAILABILITY SCHEMA & MODEL
   ========================================================================== */
export interface IService extends Document {
  oscId: string;
  serviceType: 'shelter' | 'medical' | 'legal' | 'counselling' | 'police' | 'other';
  title: string;
  status: 'Available' | 'Limited' | 'Unavailable';
  contactPerson?: string;
  notes?: string;
  lastUpdated: Date;
  updatedBy: string;
}

const ServiceSchema = new Schema<IService>({
  oscId: { type: String, required: true, index: true },
  serviceType: { 
    type: String, 
    required: true,
    enum: ['shelter', 'medical', 'legal', 'counselling', 'police', 'other']
  },
  title: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['Available', 'Limited', 'Unavailable'],
    default: 'Available'
  },
  contactPerson: String,
  notes: String,
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'Admin' }
});

/* ==========================================================================
   6. REFERRAL SCHEMA & MODEL
   ========================================================================== */
export interface IReferral extends Document {
  referralCode: string;
  requestReference: string;
  oscId: string;
  beneficiaryAlias: string;
  victimContactMasked: string;
  requestedServices: string[];
  priority: 'Immediate Emergency' | 'Urgent (< 24h)' | 'Routine (< 72h)';
  status: 'New' | 'Under Review' | 'Accepted' | 'Rejected' | 'Arrival Confirmed' | 'Additional Info Needed';
  rejectionReason?: string;
  allocatedShelterBed?: boolean;
  assignedStaffId?: string;
  assignedStaffName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  referralCode: { type: String, required: true, unique: true },
  requestReference: { type: String, required: true, index: true },
  oscId: { type: String, required: true, index: true },
  beneficiaryAlias: { type: String, required: true },
  victimContactMasked: { type: String, required: true },
  requestedServices: [{ type: String }],
  priority: { 
    type: String, 
    required: true, 
    enum: ['Immediate Emergency', 'Urgent (< 24h)', 'Routine (< 72h)'],
    default: 'Urgent (< 24h)'
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['New', 'Under Review', 'Accepted', 'Rejected', 'Arrival Confirmed', 'Additional Info Needed'],
    default: 'New'
  },
  rejectionReason: String,
  allocatedShelterBed: { type: Boolean, default: false },
  assignedStaffId: String,
  assignedStaffName: String,
  notes: String
}, { timestamps: true });

/* ==========================================================================
   7. CASE COORDINATION SCHEMA & MODEL
   ========================================================================== */
export interface ICase extends Document {
  caseNumber: string;
  oscId: string;
  referralId?: string;
  beneficiaryAlias: string;
  age?: number;
  intakeDate: Date;
  servicesProvided: string[];
  status: 'Intake Completed' | 'Services in Progress' | 'Follow-up Scheduled' | 'Case Closed';
  assignedStaffId: string;
  assignedStaffName: string;
  riskAssessment: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>({
  caseNumber: { type: String, required: true, unique: true },
  oscId: { type: String, required: true, index: true },
  referralId: String,
  beneficiaryAlias: { type: String, required: true },
  age: Number,
  intakeDate: { type: Date, default: Date.now },
  servicesProvided: [{ type: String }],
  status: { 
    type: String, 
    required: true, 
    enum: ['Intake Completed', 'Services in Progress', 'Follow-up Scheduled', 'Case Closed'],
    default: 'Intake Completed'
  },
  assignedStaffId: { type: String, required: true },
  assignedStaffName: { type: String, required: true },
  riskAssessment: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  }
}, { timestamps: true });

/* ==========================================================================
   8. CASE NOTE SCHEMA & MODEL
   ========================================================================== */
export interface ICaseNote extends Document {
  caseId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  encryptedContent: string;
  isRestricted: boolean;
  createdAt: Date;
}

const CaseNoteSchema = new Schema<ICaseNote>({
  caseId: { type: String, required: true, index: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  encryptedContent: { type: String, required: true },
  isRestricted: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

/* ==========================================================================
   9. FOLLOW-UP SCHEDULE SCHEMA & MODEL
   ========================================================================== */
export interface IFollowUp extends Document {
  caseId: string;
  scheduledDate: Date;
  type: 'In-Person Check' | 'Telephonic Check' | 'Legal Hearing' | 'Medical Review';
  status: 'Pending' | 'Completed' | 'Rescheduled' | 'Missed';
  assignedTo: string;
  notes?: string;
}

const FollowUpSchema = new Schema<IFollowUp>({
  caseId: { type: String, required: true, index: true },
  scheduledDate: { type: Date, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['In-Person Check', 'Telephonic Check', 'Legal Hearing', 'Medical Review']
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Rescheduled', 'Missed'],
    default: 'Pending'
  },
  assignedTo: { type: String, required: true },
  notes: String
});

/* ==========================================================================
   10. NOTIFICATION SCHEMA & MODEL
   ========================================================================== */
export interface INotification extends Document {
  recipientType: 'staff' | 'victim' | 'centre';
  recipientId: string; // oscId, userId, or trackingReference
  title: string;
  message: string;
  type: 'capacity_alert' | 'new_referral' | 'referral_status' | 'case_note' | 'message' | 'system';
  referenceId?: string;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientType: { type: String, required: true, enum: ['staff', 'victim', 'centre'] },
  recipientId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['capacity_alert', 'new_referral', 'referral_status', 'case_note', 'message', 'system']
  },
  referenceId: String,
  readAt: Date,
  createdAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ recipientId: 1, readAt: 1 });

/* ==========================================================================
   11. ASSISTANCE REQUEST SCHEMA & MODEL (Screen 2 & 3)
   ========================================================================== */
export interface IAssistanceRequest extends Document {
  requestReference: string;
  trackingToken: string;
  isEmergency: boolean;
  isGuest: boolean;
  servicesNeeded: string[];
  safeContact: {
    method: 'phone' | 'whatsapp' | 'sms' | 'in_person_only';
    value?: string;
    safeTimeToContact?: string;
  };
  location: {
    district: string;
    state: string;
    coordinates?: { lat: number; lng: number };
    approxAddress?: string;
  };
  urgency: 'critical' | 'urgent' | 'routine';
  shelterRequested: boolean;
  accessibilityNeeds: string[];
  selectedOSCId?: string;
  referralId?: string;
  status: 'submitted' | 'matching' | 'referral_sent' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const AssistanceRequestSchema = new Schema<IAssistanceRequest>({
  requestReference: { type: String, required: true, unique: true, index: true },
  trackingToken: { type: String, required: true, index: true },
  isEmergency: { type: Boolean, default: false },
  isGuest: { type: Boolean, default: true },
  servicesNeeded: [{ type: String }],
  safeContact: {
    method: { type: String, default: 'in_person_only' },
    value: String,
    safeTimeToContact: String
  },
  location: {
    district: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    },
    approxAddress: String
  },
  urgency: { type: String, default: 'urgent' },
  shelterRequested: { type: Boolean, default: false },
  accessibilityNeeds: [{ type: String }],
  selectedOSCId: String,
  referralId: String,
  status: { 
    type: String, 
    enum: ['submitted', 'matching', 'referral_sent', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'submitted'
  }
}, { timestamps: true });

/* ==========================================================================
   12. COMMUNICATION / IN-APP MESSAGES SCHEMA & MODEL (Screen 7)
   ========================================================================== */
export interface ICommunication extends Document {
  conversationId: string; // requestReference or caseId
  senderRole: 'victim' | 'staff' | 'system';
  senderName: string;
  messageText: string;
  isCallbackRequest?: boolean;
  callbackDetails?: {
    preferredTime?: string;
    safePhone?: string;
  };
  readAt?: Date;
  createdAt: Date;
}

const CommunicationSchema = new Schema<ICommunication>({
  conversationId: { type: String, required: true, index: true },
  senderRole: { type: String, required: true, enum: ['victim', 'staff', 'system'] },
  senderName: { type: String, required: true },
  messageText: { type: String, required: true },
  isCallbackRequest: { type: Boolean, default: false },
  callbackDetails: {
    preferredTime: String,
    safePhone: String
  },
  readAt: Date,
  createdAt: { type: Date, default: Date.now }
});

CommunicationSchema.index({ conversationId: 1, createdAt: 1 });

/* ==========================================================================
   13. REQUEST EVENT / TIMELINE SCHEMA & MODEL (Screen 6)
   ========================================================================== */
export interface IRequestEvent extends Document {
  requestReference: string;
  eventStage: string;
  title: string;
  description: string;
  performedBy: string;
  timestamp: Date;
}

const RequestEventSchema = new Schema<IRequestEvent>({
  requestReference: { type: String, required: true, index: true },
  eventStage: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  performedBy: { type: String, default: 'SakhiLink System' },
  timestamp: { type: Date, default: Date.now }
});

/* ==========================================================================
   14. AUDIT LOG SCHEMA & MODEL
   ========================================================================== */
export interface IAuditLog extends Document {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  ipAddress?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  ipAddress: String,
  details: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

/* ==========================================================================
   EXPORT MONGOOSE MODELS (SAFE FOR RE-IMPORT)
   ========================================================================== */
export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const OSCModel: Model<IOSC> = mongoose.models.OSC || mongoose.model<IOSC>('OSC', OSCSchema);
export const CapacityModel: Model<ICapacity> = mongoose.models.Capacity || mongoose.model<ICapacity>('Capacity', CapacitySchema);
export const CapacityLogModel: Model<ICapacityLog> = mongoose.models.CapacityLog || mongoose.model<ICapacityLog>('CapacityLog', CapacityLogSchema);
export const ServiceModel: Model<IService> = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
export const ReferralModel: Model<IReferral> = mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);
export const CaseModel: Model<ICase> = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);
export const CaseNoteModel: Model<ICaseNote> = mongoose.models.CaseNote || mongoose.model<ICaseNote>('CaseNote', CaseNoteSchema);
export const FollowUpModel: Model<IFollowUp> = mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
export const NotificationModel: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const AssistanceRequestModel: Model<IAssistanceRequest> = mongoose.models.AssistanceRequest || mongoose.model<IAssistanceRequest>('AssistanceRequest', AssistanceRequestSchema);
export const CommunicationModel: Model<ICommunication> = mongoose.models.Communication || mongoose.model<ICommunication>('Communication', CommunicationSchema);
export const RequestEventModel: Model<IRequestEvent> = mongoose.models.RequestEvent || mongoose.model<IRequestEvent>('RequestEvent', RequestEventSchema);
export const AuditLogModel: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
