import {
  OSCDocument,
  CapacityDocument,
  CapacityLogDocument,
  ServiceDocument,
  ReferralDocument,
  CaseDocument,
  CaseNoteDocument,
  FollowUpDocument,
  NotificationDocument,
  UserDocument,
  AuditLogDocument
} from '../types/database';

export const CURRENT_OSC: OSCDocument = {
  _id: 'osc-ka-blr-01',
  name: 'Sakhi One Stop Centre, Bengaluru Urban',
  centreCode: 'OSC-KA-BLR-01',
  district: 'Bengaluru Urban',
  state: 'Karnataka',
  address: 'Bowring and Lady Curzon Hospital Campus, Shivajinagar, Bengaluru - 560001',
  coordinates: {
    lat: 12.9822,
    lng: 77.6050
  },
  contact: {
    helpline: '181 / 080-22867540',
    landline: '080-22867541',
    email: 'blr-urban.sakhi@karnataka.gov.in'
  },
  operatingHours: '24 Hours / 7 Days a Week (Continuous Emergency Response)',
  status: 'active',
  verificationStatus: 'verified_government',
  assignedStaffCount: 14
};

export const INITIAL_CAPACITY: CapacityDocument = {
  _id: 'cap-01',
  oscId: 'osc-ka-blr-01',
  totalBeds: 30,
  occupiedBeds: 18,
  unavailableBeds: 2,
  availableBeds: 10, // A = 30 - 18 - 2 = 10
  occupancyRate: 60.0,
  updatedAt: '2026-10-30T14:30:00Z',
  lastVerifiedFreshness: 'Verified within last 2 hours'
};

export const INITIAL_CAPACITY_LOGS: CapacityLogDocument[] = [
  {
    _id: 'log-01',
    oscId: 'osc-ka-blr-01',
    previousValues: { totalBeds: 30, occupiedBeds: 17, unavailableBeds: 2, availableBeds: 11 },
    newValues: { totalBeds: 30, occupiedBeds: 18, unavailableBeds: 2, availableBeds: 10 },
    reason: 'admission',
    changedBy: 'Priya Sharma (Case Coordinator)',
    timestamp: '2026-10-30T14:30:00Z'
  },
  {
    _id: 'log-02',
    oscId: 'osc-ka-blr-01',
    previousValues: { totalBeds: 30, occupiedBeds: 18, unavailableBeds: 1, availableBeds: 11 },
    newValues: { totalBeds: 30, occupiedBeds: 17, unavailableBeds: 2, availableBeds: 11 },
    reason: 'maintenance',
    changedBy: 'Ananya Deshmukh (Administrator)',
    timestamp: '2026-10-30T11:15:00Z'
  },
  {
    _id: 'log-03',
    oscId: 'osc-ka-blr-01',
    previousValues: { totalBeds: 30, occupiedBeds: 19, unavailableBeds: 1, availableBeds: 10 },
    newValues: { totalBeds: 30, occupiedBeds: 18, unavailableBeds: 1, availableBeds: 11 },
    reason: 'discharge',
    changedBy: 'Priya Sharma (Case Coordinator)',
    timestamp: '2026-10-30T09:45:00Z'
  }
];

export const INITIAL_SERVICES: ServiceDocument[] = [
  {
    _id: 'srv-01',
    oscId: 'osc-ka-blr-01',
    serviceType: 'temporary_shelter',
    title: 'Temporary Shelter',
    status: 'Available',
    operatingHours: '24/7 Continuous Admission',
    additionalNotes: '10 beds currently available; clean hygiene packs and meals ready.',
    updatedBy: 'Ananya Deshmukh',
    updatedAt: '2026-10-30T14:30:00Z'
  },
  {
    _id: 'srv-02',
    oscId: 'osc-ka-blr-01',
    serviceType: 'medical_assistance',
    title: 'Medical Assistance',
    status: 'Available',
    operatingHours: '24/7 On-duty Nurse + Doctor on Call',
    additionalNotes: 'Bowring Hospital campus linkage; emergency trauma care on standby.',
    updatedBy: 'Dr. Meera Nambiar',
    updatedAt: '2026-10-30T08:00:00Z'
  },
  {
    _id: 'srv-03',
    oscId: 'osc-ka-blr-01',
    serviceType: 'legal_aid',
    title: 'Legal Aid & Counsel',
    status: 'Available',
    operatingHours: '10:00 AM – 6:00 PM (Emergency on-call)',
    additionalNotes: 'District Legal Services Authority (DLSA) advocate empanelled.',
    updatedBy: 'Adv. Sneha Rao',
    updatedAt: '2026-10-29T17:00:00Z'
  },
  {
    _id: 'srv-04',
    oscId: 'osc-ka-blr-01',
    serviceType: 'psychological_counselling',
    title: 'Psychological Counselling',
    status: 'Available',
    operatingHours: '9:00 AM – 7:00 PM (Trauma de-escalation 24/7)',
    additionalNotes: '2 full-time female clinical counsellors on duty.',
    updatedBy: 'Radha Hegde',
    updatedAt: '2026-10-30T10:00:00Z'
  },
  {
    _id: 'srv-05',
    oscId: 'osc-ka-blr-01',
    serviceType: 'police_assistance_coordination',
    title: 'Police Assistance Coordination',
    status: 'Available',
    operatingHours: '24/7 Women Police Liaison Desk',
    additionalNotes: 'Sub-Inspector Geeta stationed for Zero FIR and safety orders.',
    updatedBy: 'SI Geeta Patil',
    updatedAt: '2026-10-30T12:00:00Z'
  },
  {
    _id: 'srv-06',
    oscId: 'osc-ka-blr-01',
    serviceType: 'transportation',
    title: 'Emergency Transportation',
    status: 'Available',
    operatingHours: '24/7 Dedicated Ambulance & Safe Escort',
    additionalNotes: '1 official OSC rescue vehicle stationed on-site.',
    updatedBy: 'Priya Sharma',
    updatedAt: '2026-10-30T09:00:00Z'
  },
  {
    _id: 'srv-07',
    oscId: 'osc-ka-blr-01',
    serviceType: 'video_conferencing',
    title: 'Video Conferencing (Court & DLSA)',
    status: 'Limited',
    operatingHours: '10:00 AM – 5:00 PM on Court Working Days',
    additionalNotes: 'VC terminal 1 undergoing optical fiber calibration; terminal 2 operational.',
    updatedBy: 'Ananya Deshmukh',
    updatedAt: '2026-10-29T16:00:00Z'
  },
  {
    _id: 'srv-08',
    oscId: 'osc-ka-blr-01',
    serviceType: 'food_and_basic_necessities',
    title: 'Food & Basic Necessities',
    status: 'Available',
    operatingHours: '24/7 Continuous Provision',
    additionalNotes: 'Hot nutritious meals, baby food, clean clothing, and sanitary kits stocked.',
    updatedBy: 'Priya Sharma',
    updatedAt: '2026-10-30T07:30:00Z'
  }
];

export const INITIAL_REFERRALS: ReferralDocument[] = [
  {
    _id: 'ref-01',
    referralCode: 'REF-2026-0891',
    oscId: 'osc-ka-blr-01',
    requestDateTime: '2026-10-30T15:10:00Z',
    referringAuthority: '181 Women Helpline (State Control)',
    responderId: 'WHL-AGNT-44',
    requirements: {
      requiredServices: ['Safe Shelter', 'Medical Assistance', 'Counselling'],
      accommodationNeeded: true,
      accompanyingMinors: 1
    },
    priority: 'critical',
    status: 'New',
    assignedStaffName: 'Priya Sharma'
  },
  {
    _id: 'ref-02',
    referralCode: 'REF-2026-0889',
    oscId: 'osc-ka-blr-01',
    requestDateTime: '2026-10-30T13:45:00Z',
    referringAuthority: 'Commercial Street Police Station',
    responderId: 'POL-PS-892',
    requirements: {
      requiredServices: ['Legal Assistance', 'Police Coordination'],
      accommodationNeeded: false,
      accompanyingMinors: 0
    },
    priority: 'urgent',
    status: 'Under Review',
    assignedStaffName: 'Adv. Sneha Rao'
  },
  {
    _id: 'ref-03',
    referralCode: 'REF-2026-0884',
    oscId: 'osc-ka-blr-01',
    requestDateTime: '2026-10-30T11:20:00Z',
    referringAuthority: 'Bowring Hospital Casualty Ward',
    responderId: 'HOSP-CMO-02',
    requirements: {
      requiredServices: ['Safe Shelter', 'Trauma Counselling', 'Police Assistance'],
      accommodationNeeded: true,
      accompanyingMinors: 0
    },
    priority: 'critical',
    status: 'Accepted',
    assignedStaffName: 'Priya Sharma'
  },
  {
    _id: 'ref-04',
    referralCode: 'REF-2026-0879',
    oscId: 'osc-ka-blr-01',
    requestDateTime: '2026-10-30T09:15:00Z',
    referringAuthority: 'District Child Protection Unit (DCPU)',
    responderId: 'DCPU-OFC-12',
    requirements: {
      requiredServices: ['Safe Shelter', 'Legal Assistance'],
      accommodationNeeded: true,
      accompanyingMinors: 2
    },
    priority: 'urgent',
    status: 'Arrival Confirmed',
    assignedStaffName: 'Priya Sharma'
  },
  {
    _id: 'ref-05',
    referralCode: 'REF-2026-0872',
    oscId: 'osc-ka-blr-01',
    requestDateTime: '2026-10-29T16:30:00Z',
    referringAuthority: 'Community Protection Volunteer',
    responderId: 'VOL-771',
    requirements: {
      requiredServices: ['Counselling'],
      accommodationNeeded: false,
      accompanyingMinors: 0
    },
    priority: 'routine',
    status: 'Awaiting Clarification',
    assignedStaffName: 'Radha Hegde'
  },
  {
    _id: 'ref-06',
    referralCode: 'REF-2026-0865',
    oscId: 'osc-ka-blr-01',
    requestDateTime: '2026-10-29T12:00:00Z',
    referringAuthority: '112 ERSS Emergency Response',
    responderId: 'ERSS-DISP-08',
    requirements: {
      requiredServices: ['Safe Shelter', 'Medical Assistance'],
      accommodationNeeded: true,
      accompanyingMinors: 0
    },
    priority: 'urgent',
    status: 'Completed',
    assignedStaffName: 'Priya Sharma'
  }
];

export const INITIAL_CASES: CaseDocument[] = [
  {
    _id: 'case-01',
    caseCode: 'CASE-2026-0142',
    referralId: 'ref-04',
    oscId: 'osc-ka-blr-01',
    status: 'Services in Progress',
    beneficiaryAlias: 'Beneficiary #142 (K.R.)',
    age: 29,
    intakeDate: '2026-10-30T10:00:00Z',
    assignedStaffId: 'usr-02',
    assignedStaffName: 'Priya Sharma',
    servicesProvided: ['Shelter Bed #08', 'Pediatric Checkup', 'Trauma Intake'],
    bedNumber: 'Bed #08'
  },
  {
    _id: 'case-02',
    caseCode: 'CASE-2026-0140',
    referralId: 'ref-03',
    oscId: 'osc-ka-blr-01',
    status: 'Admission Initiated',
    beneficiaryAlias: 'Beneficiary #140 (S.V.)',
    age: 34,
    intakeDate: '2026-10-30T12:15:00Z',
    assignedStaffId: 'usr-02',
    assignedStaffName: 'Priya Sharma',
    servicesProvided: ['First Aid Treatment', 'Medical Forensic Report'],
    bedNumber: 'Bed #12'
  },
  {
    _id: 'case-03',
    caseCode: 'CASE-2026-0138',
    referralId: 'ref-prev-01',
    oscId: 'osc-ka-blr-01',
    status: 'Follow-up Scheduled',
    beneficiaryAlias: 'Beneficiary #138 (M.P.)',
    age: 26,
    intakeDate: '2026-10-27T15:00:00Z',
    assignedStaffId: 'usr-04',
    assignedStaffName: 'Adv. Sneha Rao',
    servicesProvided: ['PWDVA Protection Order Filed', 'Counselling Session 3', 'Shelter 4 Days'],
    bedNumber: 'Discharged to Swadhar Greh'
  },
  {
    _id: 'case-04',
    caseCode: 'CASE-2026-0135',
    referralId: 'ref-prev-02',
    oscId: 'osc-ka-blr-01',
    status: 'Case Closed',
    beneficiaryAlias: 'Beneficiary #135 (A.B.)',
    age: 41,
    intakeDate: '2026-10-22T11:00:00Z',
    assignedStaffId: 'usr-01',
    assignedStaffName: 'Ananya Deshmukh',
    servicesProvided: ['Family Mediation', 'Zero FIR Lodged', 'Livelihood Placement'],
    dischargeDate: '2026-10-28T16:00:00Z',
    dischargeSummary: 'Beneficiary securely settled in independent working women hostel with legal protection in place.'
  }
];

export const INITIAL_CASE_NOTES: CaseNoteDocument[] = [
  {
    _id: 'cn-01',
    caseId: 'case-01',
    authorId: 'usr-02',
    authorName: 'Priya Sharma',
    authorRole: 'Case Coordinator',
    encryptedContent: 'Beneficiary arrived with 4-year-old child following severe domestic harassment. Bed #08 allocated in wing B. Immediate hot meal and pediatric hygiene kit provided. Child is calm. Psychosocial evaluation scheduled for tomorrow morning.',
    isRestricted: true,
    createdAt: '2026-10-30T10:45:00Z'
  },
  {
    _id: 'cn-02',
    caseId: 'case-01',
    authorId: 'usr-03',
    authorName: 'Radha Hegde',
    authorRole: 'Psychological Counsellor',
    encryptedContent: 'Initial trauma de-escalation conducted. Beneficiary expresses safety concerns regarding workplace commute. Safety plan formulated; recommended temporary leave of absence with employer notification assistance.',
    isRestricted: true,
    createdAt: '2026-10-30T13:20:00Z'
  }
];

export const INITIAL_FOLLOW_UPS: FollowUpDocument[] = [
  {
    _id: 'fu-01',
    caseId: 'case-01',
    caseCode: 'CASE-2026-0142',
    dueDate: '2026-10-31',
    assignedTo: 'Radha Hegde',
    activityType: 'telephonic_welfare_check',
    notes: 'Evaluate emotional stability and child comfort post admission night 1.',
    status: 'Pending'
  },
  {
    _id: 'fu-02',
    caseId: 'case-03',
    caseCode: 'CASE-2026-0138',
    dueDate: '2026-11-02',
    assignedTo: 'Adv. Sneha Rao',
    activityType: 'legal_hearing_status',
    notes: 'Verify Magistrate Court protection order listing for Interim Relief.',
    status: 'Pending'
  },
  {
    _id: 'fu-03',
    caseId: 'case-04',
    caseCode: 'CASE-2026-0135',
    dueDate: '2026-10-29',
    assignedTo: 'Priya Sharma',
    activityType: 'home_visit_verification',
    notes: '30-day post-discharge wellness check with hostel warden.',
    status: 'Completed'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationDocument[] = [
  {
    _id: 'notif-01',
    recipientId: 'usr-02',
    type: 'new_referral',
    message: 'New critical referral REF-2026-0891 received from 181 Women Helpline.',
    referralOrCaseLink: 'ref-01',
    createdAt: '2026-10-30T15:10:00Z'
  },
  {
    _id: 'notif-02',
    recipientId: 'usr-01',
    type: 'capacity_changed',
    message: 'Shelter capacity updated: Occupancy at 60.0% (10 beds available).',
    createdAt: '2026-10-30T14:30:00Z'
  },
  {
    _id: 'notif-03',
    recipientId: 'usr-02',
    type: 'admission_recorded',
    message: 'Admission recorded for Case CASE-2026-0142 by Priya Sharma.',
    referralOrCaseLink: 'case-01',
    readAt: '2026-10-30T11:00:00Z',
    createdAt: '2026-10-30T10:45:00Z'
  },
  {
    _id: 'notif-04',
    recipientId: 'usr-03',
    type: 'follow_up_due',
    message: 'Follow-up welfare check scheduled for CASE-2026-0142 tomorrow.',
    createdAt: '2026-10-30T10:00:00Z'
  }
];

export const INITIAL_STAFF: UserDocument[] = [
  {
    _id: 'usr-01',
    name: 'Ananya Deshmukh',
    email: 'manager.bangalore@sakhi.gov.in',
    passwordHash: '$2b$12$K1...',
    role: 'centre_manager',
    oscId: 'osc-ka-blr-01',
    active: true,
    phone: '+91 98450 11200',
    badgeId: 'OSC-MGR-01',
    createdAt: '2024-03-01T00:00:00Z'
  },
  {
    _id: 'usr-02',
    name: 'Priya Sharma',
    email: 'priya.case@sakhi.gov.in',
    passwordHash: '$2b$12$L2...',
    role: 'case_manager',
    oscId: 'osc-ka-blr-01',
    active: true,
    phone: '+91 98450 11201',
    badgeId: 'OSC-CSW-04',
    createdAt: '2024-04-15T00:00:00Z'
  },
  {
    _id: 'usr-03',
    name: 'Radha Hegde',
    email: 'radha.couns@sakhi.gov.in',
    passwordHash: '$2b$12$M3...',
    role: 'counsellor',
    oscId: 'osc-ka-blr-01',
    active: true,
    phone: '+91 98450 11202',
    badgeId: 'OSC-CNS-02',
    createdAt: '2024-06-01T00:00:00Z'
  },
  {
    _id: 'usr-04',
    name: 'Adv. Sneha Rao',
    email: 'sneha.legal@sakhi.gov.in',
    passwordHash: '$2b$12$N4...',
    role: 'legal_advisor',
    oscId: 'osc-ka-blr-01',
    active: true,
    phone: '+91 98450 11203',
    badgeId: 'OSC-LGL-01',
    createdAt: '2024-05-10T00:00:00Z'
  },
  {
    _id: 'usr-05',
    name: 'Dr. Meera Nambiar',
    email: 'meera.med@sakhi.gov.in',
    passwordHash: '$2b$12$P5...',
    role: 'medical_officer',
    oscId: 'osc-ka-blr-01',
    active: true,
    phone: '+91 98450 11204',
    badgeId: 'OSC-MED-03',
    createdAt: '2024-07-20T00:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogDocument[] = [
  {
    _id: 'aud-01',
    actorId: 'usr-02',
    actorName: 'Priya Sharma',
    actorRole: 'case_manager',
    action: 'RECORD_ADMISSION',
    entityType: 'case',
    entityId: 'case-01',
    timestamp: '2026-10-30T10:45:00Z',
    details: 'Allocated Bed #08 to Beneficiary #142 under referral REF-2026-0879.'
  },
  {
    _id: 'aud-02',
    actorId: 'usr-01',
    actorName: 'Ananya Deshmukh',
    actorRole: 'centre_manager',
    action: 'UPDATE_CAPACITY',
    entityType: 'capacity',
    entityId: 'cap-01',
    timestamp: '2026-10-30T11:15:00Z',
    details: 'Marked bed #14 as unavailable for electrical maintenance.'
  },
  {
    _id: 'aud-03',
    actorId: 'usr-02',
    actorName: 'Priya Sharma',
    actorRole: 'case_manager',
    action: 'ACCEPT_REFERRAL',
    entityType: 'referral',
    entityId: 'ref-03',
    timestamp: '2026-10-30T11:30:00Z',
    details: 'Accepted critical referral from Bowring Hospital Casualty.'
  }
];
