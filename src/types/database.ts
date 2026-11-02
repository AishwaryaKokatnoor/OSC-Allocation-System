/**
 * MongoDB Database Architecture Types for SakhiLink OSC Staff Module
 * Reflects the 11 collections defined in Section 5 of the architecture.
 */

export type StaffRole = 
  | 'centre_manager' 
  | 'case_manager' 
  | 'counsellor' 
  | 'medical_officer' 
  | 'legal_advisor' 
  | 'police_liaison';

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: StaffRole;
  oscId: string;
  active: boolean;
  phone?: string;
  badgeId?: string;
  createdAt: string;
}

export interface OSCDocument {
  _id: string;
  name: string;
  centreCode: string; // e.g. "OSC-KA-BLR-01"
  address: string;
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contact: {
    helpline: string;
    landline: string;
    email: string;
  };
  operatingHours: string;
  status: 'active' | 'temporary_closure' | 'renovation';
  verificationStatus: 'verified_government' | 'pending_audit';
  assignedStaffCount: number;
}

export interface CapacityDocument {
  _id: string;
  oscId: string;
  totalBeds: number;
  occupiedBeds: number;
  unavailableBeds: number;
  availableBeds: number; // A = T - O - U
  occupancyRate: number; // (O / T) * 100
  updatedAt: string;
  lastVerifiedFreshness: string;
}

export interface CapacityLogDocument {
  _id: string;
  oscId: string;
  previousValues: {
    totalBeds: number;
    occupiedBeds: number;
    unavailableBeds: number;
    availableBeds: number;
  };
  newValues: {
    totalBeds: number;
    occupiedBeds: number;
    unavailableBeds: number;
    availableBeds: number;
  };
  reason: 'admission' | 'discharge' | 'maintenance' | 'emergency_surge' | 'capacity_adjustment';
  changedBy: string; // staff user ID or name
  timestamp: string;
}

export type ServiceStatus = 'Available' | 'Unavailable' | 'Limited';

export interface ServiceDocument {
  _id: string;
  oscId: string;
  serviceType: 
    | 'temporary_shelter' 
    | 'medical_assistance' 
    | 'legal_aid' 
    | 'psychological_counselling' 
    | 'police_assistance_coordination' 
    | 'transportation' 
    | 'video_conferencing' 
    | 'food_and_basic_necessities';
  title: string;
  status: ServiceStatus;
  operatingHours: string;
  additionalNotes: string;
  updatedBy: string;
  updatedAt: string;
}

export type ReferralStatus = 
  | 'New' 
  | 'Under Review' 
  | 'Accepted' 
  | 'Declined' 
  | 'Awaiting Clarification' 
  | 'Arrival Confirmed' 
  | 'Completed' 
  | 'Cancelled';

export type PriorityLevel = 'routine' | 'urgent' | 'critical';

export interface ReferralDocument {
  _id: string;
  referralCode: string; // e.g. "REF-2026-0891"
  oscId: string;
  requestDateTime: string;
  referringAuthority: string; // e.g. "181 Women Helpline", "District Police Station", "Community Responders"
  responderId: string;
  requirements: {
    requiredServices: string[];
    accommodationNeeded: boolean;
    accompanyingMinors: number;
  };
  priority: PriorityLevel;
  status: ReferralStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  declineReason?: string;
  alternativeRecommendation?: string;
}

export type CaseLifecycleStatus = 
  | 'Referral Accepted' 
  | 'Admission Initiated' 
  | 'Services in Progress' 
  | 'Follow-up Scheduled' 
  | 'Discharge Recorded' 
  | 'Case Closed';

export interface CaseDocument {
  _id: string;
  caseCode: string; // e.g. "CASE-2026-0142"
  referralId: string;
  oscId: string;
  status: CaseLifecycleStatus;
  beneficiaryAlias: string;
  age?: number;
  intakeDate: string;
  assignedStaffId: string;
  assignedStaffName: string;
  servicesProvided: string[];
  bedNumber?: string;
  dischargeDate?: string;
  dischargeSummary?: string;
}

export interface CaseNoteDocument {
  _id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  encryptedContent: string;
  isRestricted: boolean;
  createdAt: string;
}

export interface FollowUpDocument {
  _id: string;
  caseId: string;
  caseCode: string;
  dueDate: string;
  assignedTo: string;
  activityType: 'telephonic_welfare_check' | 'legal_hearing_status' | 'home_visit_verification' | 'medical_revisit';
  notes?: string;
  status: 'Pending' | 'Completed' | 'Overdue';
}

export interface NotificationDocument {
  _id: string;
  recipientId: string;
  type: 
    | 'new_referral' 
    | 'referral_accepted' 
    | 'referral_declined' 
    | 'clarification_request' 
    | 'capacity_changed' 
    | 'service_availability_changed' 
    | 'follow_up_due' 
    | 'admission_recorded' 
    | 'discharge_recorded' 
    | 'manager_announcement';
  message: string;
  referralOrCaseLink?: string;
  readAt?: string;
  createdAt: string;
}

export interface AuditLogDocument {
  _id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'capacity' | 'referral' | 'case' | 'service' | 'staff' | 'osc_profile' | 'assistance_request';
  entityId: string;
  timestamp: string;
  details: string;
}

export type EmergencyServiceCategory =
  | 'shelter'
  | 'medical'
  | 'police'
  | 'legal'
  | 'emotional'
  | 'multiple';

export interface AssistanceRequestDocument {
  _id: string;
  requestId: string; // e.g. "EMG-2026-8942"
  idempotencyKey?: string;
  isGuest: boolean;
  urgency: 'critical_emergency' | 'urgent' | 'routine';
  servicesRequested: EmergencyServiceCategory[];
  additionalDetails?: string;
  location: {
    sharedViaGPS: boolean;
    district?: string;
    city?: string;
    locality?: string;
    approxCoordinates?: {
      lat: number;
      lng: number;
    };
  };
  communication: {
    preferredMode: 'in_app' | 'phone' | 'sms' | 'no_direct_contact';
    contactNumber?: string;
    safeToCall: boolean;
    safeToMessage: boolean;
    safeTimeWindow?: string;
    preferredLanguage: string;
  };
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'Accepted' | 'Completed' | 'Cancelled';
  matchedOscId?: string;
  matchedOscName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestEventDocument {
  _id: string;
  requestId: string;
  eventType: 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 'ACCEPTED' | 'STATUS_UPDATE';
  actorType: 'victim_guest' | 'registered_user' | 'osc_staff' | 'system';
  timestamp: string;
  summary: string;
}

export type AssistanceServiceCategory =
  | 'shelter'
  | 'medical'
  | 'legal'
  | 'counselling'
  | 'police'
  | 'other';

export interface GeneralAssistanceRequestPayload {
  idempotencyKey?: string;
  requestType: 'general';
  accessType: 'guest' | 'registered';
  services: AssistanceServiceCategory[];
  description?: string;
  location: {
    state?: string;
    district?: string;
    city?: string;
    locality?: string;
    consentGiven: boolean;
    approxCoordinates?: {
      lat: number;
      lng: number;
    };
  };
  preferences: {
    preferredLanguage: string;
    accessibilityNeeds?: string[];
    preferredContactMethod: 'in_app' | 'phone' | 'sms' | 'no_direct_contact';
    contactNumber?: string;
    safeToCall: boolean;
    safeToMessage: boolean;
    safeTimeWindow?: string;
  };
}

// --- SCREEN 4: OSC DISCOVERY & RECOMMENDATIONS TYPES ---

export type OSCCapacityStatus = 'Available' | 'Limited' | 'Not Available' | 'Unverified';

export interface OSCServiceSummary {
  id: string;
  serviceType: string;
  title: string;
  category: AssistanceServiceCategory;
  status: 'Available' | 'Limited' | 'Unavailable';
  operatingHours: string;
  notes?: string;
}

export interface OSCDiscoveryCardItem {
  _id: string;
  id: string;
  name: string;
  centreCode: string;
  district: string;
  state: string;
  address: string; // Sanitized public landmark, e.g. District Hospital Campus
  coordinates: {
    lat: number;
    lng: number;
  };
  contact: {
    helpline: string;
    landline?: string;
    email?: string;
  };
  operatingHours: string;
  status: 'active' | 'temporary_closure' | 'renovation';
  verificationStatus: 'verified_government' | 'pending_audit';
  distanceKm?: number;
  capacity: {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    status: OSCCapacityStatus;
    isStale: boolean;
    updatedAt: string;
    freshnessText: string;
  };
  services: OSCServiceSummary[];
  accessibilityFacilities: string[];
  recommendation?: {
    score: number;
    matchPercentage: number;
    breakdown: {
      distanceScore: number;
      capacityScore: number;
      serviceScore: number;
      accessibilityScore: number;
    };
    explanation: string;
    isEligible: boolean;
  };
}

export interface OSCFilterOptions {
  states: string[];
  districtsByState: Record<string, string[]>;
  services: Array<{ id: AssistanceServiceCategory; label: string }>;
  accessibility: Array<{ id: string; label: string }>;
  capacityOptions: Array<{ id: string; label: string }>;
}

export interface OSCRecommendationResponse {
  requestReference?: string;
  requestedServices: string[];
  requestedAccessibility: string[];
  userLocation?: {
    district?: string;
    state?: string;
    approxCoordinates?: { lat: number; lng: number };
  };
  matchingWeights: {
    distance: number;
    capacity: number;
    services: number;
    accessibility: number;
  };
  totalEligible: number;
  recommendations: OSCDiscoveryCardItem[];
}


