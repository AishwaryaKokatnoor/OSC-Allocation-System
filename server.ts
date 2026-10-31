import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

interface ServerUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  oscId: string;
  active: boolean;
  phone?: string;
  badgeId?: string;
}

// In-Memory MongoDB Mock State adhering to Section 5 Collections
let mockUsers: ServerUser[] = [
  {
    _id: 'usr-01',
    name: 'Ananya Deshmukh',
    email: 'manager.bangalore@sakhi.gov.in',
    passwordHash: '$2b$12$eX4mPl3...',
    role: 'centre_manager', // Manager Role
    oscId: 'osc-ka-blr-01',
    active: true,
    phone: '+91 98450 11200',
    badgeId: 'OSC-MGR-01'
  },
  {
    _id: 'usr-02',
    name: 'Priya Sharma',
    email: 'priya.case@sakhi.gov.in',
    passwordHash: '$2b$12$eX4mPl3...',
    role: 'case_manager', // OSC Staff Role
    oscId: 'osc-ka-blr-01',
    active: true,
    phone: '+91 98450 11201',
    badgeId: 'OSC-CSW-04'
  }
];

// Multi-Centre OSC Database for Staff & Discovery Modules
interface MockOSCEntry {
  _id: string;
  name: string;
  centreCode: string;
  district: string;
  state: string;
  address: string;
  coordinates: { lat: number; lng: number };
  contact: { helpline: string; landline?: string; email?: string };
  operatingHours: string;
  status: 'active' | 'temporary_closure' | 'renovation';
  verificationStatus: 'verified_government' | 'pending_audit';
  assignedStaffCount: number;
  accessibilityFacilities: string[];
}

let mockOSCs: MockOSCEntry[] = [
  {
    _id: 'osc-ka-blr-01',
    name: 'Sakhi One Stop Centre, Bengaluru Urban',
    centreCode: 'OSC-KA-BLR-01',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    address: 'Bowring and Lady Curzon Hospital Campus, Shivajinagar, Bengaluru - 560001',
    coordinates: { lat: 12.9822, lng: 77.6050 },
    contact: {
      helpline: '181 / 080-22867540',
      landline: '080-22867541',
      email: 'blr-urban.sakhi@karnataka.gov.in'
    },
    operatingHours: '24 Hours / 7 Days a Week (Continuous Emergency Response)',
    status: 'active',
    verificationStatus: 'verified_government',
    assignedStaffCount: 14,
    accessibilityFacilities: ['wheelchair', 'infant_care', 'medical_storage', 'ground_floor']
  },
  {
    _id: 'osc-ka-blr-02',
    name: 'Sakhi One Stop Centre, Bengaluru Rural',
    centreCode: 'OSC-KA-BLR-02',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    address: 'District Civil Hospital Complex, Nelamangala, Bengaluru Rural - 562123',
    coordinates: { lat: 13.0970, lng: 77.3910 },
    contact: {
      helpline: '181 / 080-27722114',
      landline: '080-27722115',
      email: 'blr-rural.sakhi@karnataka.gov.in'
    },
    operatingHours: '24 Hours / 7 Days a Week',
    status: 'active',
    verificationStatus: 'verified_government',
    assignedStaffCount: 10,
    accessibilityFacilities: ['wheelchair', 'infant_care']
  },
  {
    _id: 'osc-del-01',
    name: 'Sakhi One Stop Centre, Central Delhi',
    centreCode: 'OSC-DL-CEN-01',
    district: 'Central Delhi',
    state: 'Delhi',
    address: 'Sanjeevan Hospital Compound, Ansari Road, Daryaganj, New Delhi - 110002',
    coordinates: { lat: 28.6448, lng: 77.2405 },
    contact: {
      helpline: '181 / 011-23274501',
      landline: '011-23274502',
      email: 'central-delhi.sakhi@delhi.gov.in'
    },
    operatingHours: '24 Hours / 7 Days a Week',
    status: 'active',
    verificationStatus: 'verified_government',
    assignedStaffCount: 16,
    accessibilityFacilities: ['wheelchair', 'infant_care', 'hearing_sign', 'elderly_care']
  },
  {
    _id: 'osc-del-02',
    name: 'Sakhi One Stop Centre, South Delhi',
    centreCode: 'OSC-DL-STH-02',
    district: 'South Delhi',
    state: 'Delhi',
    address: 'Pt. Madan Mohan Malaviya Hospital Campus, Malviya Nagar, New Delhi - 110017',
    coordinates: { lat: 28.5355, lng: 77.2100 },
    contact: {
      helpline: '181 / 011-26680145',
      landline: '011-26680146',
      email: 'south-delhi.sakhi@delhi.gov.in'
    },
    operatingHours: '24 Hours / 7 Days a Week',
    status: 'active',
    verificationStatus: 'verified_government',
    assignedStaffCount: 12,
    accessibilityFacilities: ['wheelchair', 'infant_care']
  },
  {
    _id: 'osc-mum-01',
    name: 'Sakhi One Stop Centre, Mumbai Suburban',
    centreCode: 'OSC-MH-MUM-01',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    address: 'K.B. Bhabha Municipal Hospital Grounds, Bandra West, Mumbai - 400050',
    coordinates: { lat: 19.0596, lng: 72.8295 },
    contact: {
      helpline: '181 / 022-26422775',
      landline: '022-26422776',
      email: 'mumbai-sub.sakhi@maharashtra.gov.in'
    },
    operatingHours: '24 Hours / 7 Days a Week',
    status: 'active',
    verificationStatus: 'verified_government',
    assignedStaffCount: 15,
    accessibilityFacilities: ['wheelchair', 'infant_care', 'medical_storage']
  },
  {
    _id: 'osc-mum-02',
    name: 'Sakhi One Stop Centre, Mumbai City',
    centreCode: 'OSC-MH-MUM-02',
    district: 'Mumbai City',
    state: 'Maharashtra',
    address: 'G.T. Hospital Complex, L.T. Marg, Fort, Mumbai - 400001',
    coordinates: { lat: 18.9400, lng: 72.8350 },
    contact: {
      helpline: '181 / 022-22620450',
      landline: '022-22620451',
      email: 'mumbai-city.sakhi@maharashtra.gov.in'
    },
    operatingHours: '24 Hours / 7 Days a Week',
    status: 'active',
    verificationStatus: 'verified_government',
    assignedStaffCount: 11,
    accessibilityFacilities: ['wheelchair']
  },
  {
    _id: 'osc-hyd-01',
    name: 'Sakhi One Stop Centre, Hyderabad',
    centreCode: 'OSC-TG-HYD-01',
    district: 'Hyderabad',
    state: 'Telangana',
    address: 'Government Maternity Hospital Premises, Petlaburj, Hyderabad - 500002',
    coordinates: { lat: 17.3616, lng: 78.4747 },
    contact: {
      helpline: '181 / 040-24528181',
      landline: '040-24528182',
      email: 'hyderabad.sakhi@telangana.gov.in'
    },
    operatingHours: '24 Hours / 7 Days a Week',
    status: 'active',
    verificationStatus: 'verified_government',
    assignedStaffCount: 13,
    accessibilityFacilities: ['wheelchair', 'infant_care', 'hearing_sign']
  },
  {
    _id: 'osc-kol-01',
    name: 'Sakhi One Stop Centre, Kolkata South',
    centreCode: 'OSC-WB-KOL-01',
    district: 'Kolkata',
    state: 'West Bengal',
    address: 'M.R. Bangur Hospital Campus, Deshapran Sasmal Road, Tollygunge, Kolkata - 700033',
    coordinates: { lat: 22.4988, lng: 88.3475 },
    contact: {
      helpline: '181 / 033-24733901',
      landline: '033-24733902',
      email: 'kolkata-south.sakhi@wb.gov.in'
    },
    operatingHours: '24 Hours / 7 Days a Week',
    status: 'active',
    verificationStatus: 'verified_government',
    assignedStaffCount: 12,
    accessibilityFacilities: ['wheelchair', 'infant_care', 'elderly_care']
  },
  {
    _id: 'osc-chn-01',
    name: 'Sakhi One Stop Centre, Chennai Central',
    centreCode: 'OSC-TN-CHN-01',
    district: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Government Kasturba Gandhi Hospital Campus, Triplicane High Road, Chennai - 600005',
    coordinates: { lat: 13.0583, lng: 80.2757 },
    contact: {
      helpline: '181 / 044-28441112',
      landline: '044-28441113',
      email: 'chennai-central.sakhi@tn.gov.in'
    },
    operatingHours: '24 Hours / 7 Days a Week',
    status: 'active',
    verificationStatus: 'verified_government',
    assignedStaffCount: 14,
    accessibilityFacilities: ['wheelchair', 'infant_care', 'hearing_sign', 'ground_floor']
  },
  {
    _id: 'osc-ka-renov-01',
    name: 'Sakhi One Stop Centre, North Transit Hub',
    centreCode: 'OSC-KA-NTH-01',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    address: 'Transit Complex, Yelahanka, Bengaluru - 560064',
    coordinates: { lat: 13.1007, lng: 77.5963 },
    contact: {
      helpline: '181 / 080-28560111',
      landline: '080-28560112',
      email: 'yelahanka-transit@karnataka.gov.in'
    },
    operatingHours: 'Temporarily Closed for Renovation',
    status: 'temporary_closure', // Inactive centre (test hard exclusion)
    verificationStatus: 'verified_government',
    assignedStaffCount: 0,
    accessibilityFacilities: ['wheelchair']
  }
];

// Reference primary OSC for Staff Portal
let mockOSC = mockOSCs[0];

// Capacities by OSC
let mockCapacities: Record<string, any> = {
  'osc-ka-blr-01': {
    _id: 'cap-01',
    oscId: 'osc-ka-blr-01',
    totalBeds: 30,
    occupiedBeds: 18,
    unavailableBeds: 2,
    availableBeds: 10,
    occupancyRate: 60.0,
    updatedAt: new Date().toISOString(),
    lastVerifiedFreshness: 'Verified within last 2 hours'
  },
  'osc-ka-blr-02': {
    _id: 'cap-02',
    oscId: 'osc-ka-blr-02',
    totalBeds: 20,
    occupiedBeds: 17,
    unavailableBeds: 1,
    availableBeds: 2, // Limited availability (<= 3)
    occupancyRate: 85.0,
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    lastVerifiedFreshness: 'Verified 3 hours ago'
  },
  'osc-del-01': {
    _id: 'cap-03',
    oscId: 'osc-del-01',
    totalBeds: 20,
    occupiedBeds: 12,
    unavailableBeds: 0,
    availableBeds: 8,
    occupancyRate: 60.0,
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastVerifiedFreshness: 'Verified 4 hours ago'
  },
  'osc-del-02': {
    _id: 'cap-04',
    oscId: 'osc-del-02',
    totalBeds: 25,
    occupiedBeds: 23,
    unavailableBeds: 2,
    availableBeds: 0, // Zero capacity (Not Available)
    occupancyRate: 100.0,
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    lastVerifiedFreshness: 'Verified 1 hour ago'
  },
  'osc-mum-01': {
    _id: 'cap-05',
    oscId: 'osc-mum-01',
    totalBeds: 30,
    occupiedBeds: 21,
    unavailableBeds: 0,
    availableBeds: 9,
    occupancyRate: 70.0,
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastVerifiedFreshness: 'Verified 2 hours ago'
  },
  'osc-mum-02': {
    _id: 'cap-06',
    oscId: 'osc-mum-02',
    totalBeds: 15,
    occupiedBeds: 10,
    unavailableBeds: 0,
    availableBeds: 5,
    occupancyRate: 66.7,
    // Stale data (> 24 hours ago) to test Unverified status handling
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastVerifiedFreshness: 'Stale (> 3 days ago)'
  },
  'osc-hyd-01': {
    _id: 'cap-07',
    oscId: 'osc-hyd-01',
    totalBeds: 18,
    occupiedBeds: 11,
    unavailableBeds: 0,
    availableBeds: 7,
    occupancyRate: 61.1,
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    lastVerifiedFreshness: 'Verified 5 hours ago'
  },
  'osc-kol-01': {
    _id: 'cap-08',
    oscId: 'osc-kol-01',
    totalBeds: 22,
    occupiedBeds: 14,
    unavailableBeds: 0,
    availableBeds: 8,
    occupancyRate: 63.6,
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    lastVerifiedFreshness: 'Verified 6 hours ago'
  },
  'osc-chn-01': {
    _id: 'cap-09',
    oscId: 'osc-chn-01',
    totalBeds: 24,
    occupiedBeds: 15,
    unavailableBeds: 0,
    availableBeds: 9,
    occupancyRate: 62.5,
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastVerifiedFreshness: 'Verified 2 hours ago'
  },
  'osc-ka-renov-01': {
    _id: 'cap-10',
    oscId: 'osc-ka-renov-01',
    totalBeds: 10,
    occupiedBeds: 0,
    unavailableBeds: 10,
    availableBeds: 0,
    occupancyRate: 0.0,
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastVerifiedFreshness: 'Inactive centre'
  }
};

let mockCapacity = mockCapacities['osc-ka-blr-01'];

let mockCapacityLogs: any[] = [
  {
    _id: 'log-01',
    oscId: 'osc-ka-blr-01',
    previousValues: { totalBeds: 30, occupiedBeds: 17, unavailableBeds: 2, availableBeds: 11 },
    newValues: { totalBeds: 30, occupiedBeds: 18, unavailableBeds: 2, availableBeds: 10 },
    reason: 'admission',
    changedBy: 'Priya Sharma (Case Coordinator)',
    timestamp: new Date().toISOString()
  }
];

let mockServices = [
  {
    _id: 'srv-01',
    oscId: 'osc-ka-blr-01',
    serviceType: 'temporary_shelter',
    title: 'Temporary Shelter',
    status: 'Available',
    operatingHours: '24/7 Continuous Admission',
    additionalNotes: '10 beds currently available; clean hygiene packs and meals ready.',
    updatedBy: 'Ananya Deshmukh',
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'srv-05',
    oscId: 'osc-ka-blr-01',
    serviceType: 'police_assistance_coordination',
    title: 'Police Assistance Coordination',
    status: 'Available',
    operatingHours: '24/7 Women Police Liaison Desk',
    additionalNotes: 'Sub-Inspector stationed for Zero FIR and safety orders.',
    updatedBy: 'SI Geeta Patil',
    updatedAt: new Date().toISOString()
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
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'srv-07',
    oscId: 'osc-ka-blr-01',
    serviceType: 'video_conferencing',
    title: 'Video Conferencing (Court & DLSA)',
    status: 'Limited',
    operatingHours: '10:00 AM – 5:00 PM on Court Working Days',
    additionalNotes: 'VC terminal 1 undergoing calibration; terminal 2 operational.',
    updatedBy: 'Ananya Deshmukh',
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'srv-08',
    oscId: 'osc-ka-blr-01',
    serviceType: 'food_and_basic_necessities',
    title: 'Food & Basic Necessities',
    status: 'Available',
    operatingHours: '24/7 Continuous Provision',
    additionalNotes: 'Hot nutritious meals, clothing, and sanitary kits stocked.',
    updatedBy: 'Priya Sharma',
    updatedAt: new Date().toISOString()
  }
];

let mockReferrals = [
  {
    _id: 'ref-01',
    referralCode: 'REF-2026-0891',
    oscId: 'osc-ka-blr-01',
    requestDateTime: new Date().toISOString(),
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
    requestDateTime: new Date(Date.now() - 3600000 * 2).toISOString(),
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
  }
];

let mockCases = [
  {
    _id: 'case-01',
    caseCode: 'CASE-2026-0142',
    referralId: 'ref-01',
    oscId: 'osc-ka-blr-01',
    status: 'Services in Progress',
    beneficiaryAlias: 'Beneficiary #142 (K.R.)',
    age: 29,
    intakeDate: new Date().toISOString(),
    assignedStaffId: 'usr-02',
    assignedStaffName: 'Priya Sharma',
    servicesProvided: ['Shelter Bed #08', 'Pediatric Checkup', 'Trauma Intake'],
    bedNumber: 'Bed #08'
  }
];

let mockCaseNotes = [
  {
    _id: 'cn-01',
    caseId: 'case-01',
    authorId: 'usr-02',
    authorName: 'Priya Sharma',
    authorRole: 'Case Coordinator',
    encryptedContent: 'Beneficiary admitted with minor child. Bed #08 allocated.',
    isRestricted: true,
    createdAt: new Date().toISOString()
  }
];

// Simple Authentication Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Default to mock session for development convenience
    (req as any).user = mockUsers[0];
    return next();
  }
  const token = authHeader.split(' ')[1];
  const user = mockUsers.find(u => u._id === token || u.email.includes(token));
  if (user) {
    (req as any).user = user;
    next();
  } else {
    (req as any).user = mockUsers[0];
    next();
  }
};

// Manager Role Guard
const requireManager = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'centre_manager') {
    return res.status(403).json({ error: 'Forbidden: Requires Centre Manager permission.' });
  }
  next();
};

/* --- REST API Endpoints --- */

// 1. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  // Find or create user session
  let matchedUser: ServerUser | undefined = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!matchedUser) {
    const newUser: ServerUser = {
      _id: 'usr-' + Date.now(),
      name: email.split('@')[0].replace('.', ' '),
      email,
      passwordHash: 'argon2$...',
      role: (role === 'manager' || role === 'centre_manager') ? 'centre_manager' : 'case_manager',
      oscId: 'osc-ka-blr-01',
      active: true,
      phone: '+91 98450 00000',
      badgeId: 'OSC-TEMP-99'
    };
    mockUsers.push(newUser);
    matchedUser = newUser;
  }

  const authenticatedUser = matchedUser;

  return res.json({
    token: `jwt_session_${authenticatedUser._id}_${Date.now()}`,
    user: {
      id: authenticatedUser._id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      oscId: authenticatedUser.oscId
    },
    oscCentre: mockOSC
  });
});

// 2. OSC Profile
app.get('/api/osc/profile', (_req: Request, res: Response) => {
  res.json(mockOSC);
});

app.put('/api/osc/profile', authenticateToken, requireManager, (req: Request, res: Response) => {
  const { contact, operatingHours } = req.body;
  if (contact) mockOSC.contact = { ...mockOSC.contact, ...contact };
  if (operatingHours) mockOSC.operatingHours = operatingHours;
  res.json({ message: 'Profile updated successfully.', osc: mockOSC });
});

// 3. Shelter Capacity: Live A = T - O - U
app.get('/api/capacity', (_req: Request, res: Response) => {
  res.json({
    capacity: mockCapacity,
    logs: mockCapacityLogs
  });
});

app.post('/api/capacity/update', authenticateToken, (req: Request, res: Response) => {
  const { action, delta = 1, reason } = req.body; // 'admission' | 'discharge' | 'maintenance'
  const user = (req as any).user;

  let newOccupied = mockCapacity.occupiedBeds;
  let newUnavailable = mockCapacity.unavailableBeds;

  if (action === 'admission') {
    newOccupied += delta;
  } else if (action === 'discharge') {
    newOccupied = Math.max(0, newOccupied - delta);
  } else if (action === 'maintenance') {
    newUnavailable += delta;
  }

  // Business Rule Checks
  if (newOccupied + newUnavailable > mockCapacity.totalBeds) {
    return res.status(400).json({ error: 'Occupied and unavailable beds cannot exceed total capacity.' });
  }

  const newAvailable = mockCapacity.totalBeds - newOccupied - newUnavailable;
  if (newAvailable < 0) {
    return res.status(400).json({ error: 'Available beds cannot be negative.' });
  }

  const previousValues = { ...mockCapacity };

  mockCapacity.occupiedBeds = newOccupied;
  mockCapacity.unavailableBeds = newUnavailable;
  mockCapacity.availableBeds = newAvailable;
  mockCapacity.occupancyRate = Number(((newOccupied / mockCapacity.totalBeds) * 100).toFixed(1));
  mockCapacity.updatedAt = new Date().toISOString();

  const logEntry = {
    _id: 'log-' + Date.now(),
    oscId: mockOSC._id,
    previousValues,
    newValues: { ...mockCapacity },
    reason: reason || action,
    changedBy: user ? user.name : 'Priya Sharma (Staff)',
    timestamp: new Date().toISOString()
  };

  mockCapacityLogs.unshift(logEntry);

  return res.json({
    message: 'Capacity updated successfully.',
    capacity: mockCapacity,
    log: logEntry
  });
});

// 4. Services
app.get('/api/services', (_req: Request, res: Response) => {
  res.json(mockServices);
});

app.put('/api/services/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, additionalNotes } = req.body;
  const srv = mockServices.find(s => s._id === id);
  if (!srv) return res.status(404).json({ error: 'Service not found.' });

  if (status) srv.status = status;
  if (additionalNotes) srv.additionalNotes = additionalNotes;
  srv.updatedAt = new Date().toISOString();
  srv.updatedBy = (req as any).user?.name || 'Staff User';

  res.json(srv);
});

// 5. Referrals
app.get('/api/referrals', (_req: Request, res: Response) => {
  res.json(mockReferrals);
});

app.put('/api/referrals/:id/status', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, declineReason } = req.body;
  const referral = mockReferrals.find(r => r._id === id);
  if (!referral) return res.status(404).json({ error: 'Referral not found.' });

  referral.status = status;
  if (declineReason) (referral as any).declineReason = declineReason;

  res.json(referral);
});

// 6. Cases & Restricted Notes
app.get('/api/cases', (_req: Request, res: Response) => {
  res.json(mockCases);
});

app.post('/api/cases/:id/notes', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;
  const { encryptedContent } = req.body;
  const user = (req as any).user;

  if (!encryptedContent) return res.status(400).json({ error: 'Note content is required.' });

  const newNote = {
    _id: 'cn-' + Date.now(),
    caseId: id,
    authorId: user?._id || 'usr-02',
    authorName: user?.name || 'Priya Sharma',
    authorRole: user?.role || 'Case Coordinator',
    encryptedContent,
    isRestricted: true,
    createdAt: new Date().toISOString()
  };

  mockCaseNotes.unshift(newNote);
  res.status(201).json(newNote);
});

// 7. Staff Management (Manager Only)
app.get('/api/staff', authenticateToken, requireManager, (_req: Request, res: Response) => {
  res.json(mockUsers);
});

// --- VICTIM MODULE: SCREEN 2 EMERGENCY ASSISTANCE APIs ---
let mockAssistanceRequests: any[] = [];
let mockRequestEvents: any[] = [];
const idempotencyStore: Map<string, { response: any; timestamp: number }> = new Map();

// POST /api/victim/emergency-request
app.post('/api/victim/emergency-request', (req: Request, res: Response) => {
  const {
    idempotencyKey,
    isGuest = true,
    servicesRequested,
    location,
    communication,
    additionalDetails
  } = req.body;

  // 1. Idempotency Check (prevent duplicate submissions on double-clicks / network retries)
  if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
    const cached = idempotencyStore.get(idempotencyKey)!;
    // Cache valid for 15 minutes
    if (Date.now() - cached.timestamp < 15 * 60 * 1000) {
      return res.status(200).json({
        ...cached.response,
        isIdempotentReplay: true
      });
    }
  }

  // 2. Validation
  if (!servicesRequested || !Array.isArray(servicesRequested) || servicesRequested.length === 0) {
    return res.status(400).json({
      error: 'Please select at least one assistance service required.'
    });
  }

  const validServices = ['shelter', 'medical', 'police', 'legal', 'emotional', 'multiple'];
  const hasInvalidService = servicesRequested.some(s => !validServices.includes(s));
  if (hasInvalidService) {
    return res.status(400).json({
      error: 'Invalid service category specified.'
    });
  }

  if (!communication || !communication.preferredMode) {
    return res.status(400).json({
      error: 'Safe communication preference is required.'
    });
  }

  if (
    (communication.preferredMode === 'phone' || communication.preferredMode === 'sms') &&
    (!communication.contactNumber || communication.contactNumber.trim().length < 10)
  ) {
    return res.status(400).json({
      error: 'A valid 10-digit contact number is required when phone or SMS contact is selected.'
    });
  }

  // 3. Location Sanitization (Never expose precise location publicly)
  const sanitizedLocation = {
    sharedViaGPS: Boolean(location?.sharedViaGPS),
    district: location?.district?.trim() || 'Central District',
    city: location?.city?.trim() || '',
    locality: location?.locality?.trim() || '',
    approxCoordinates: location?.approxCoordinates
      ? {
          // Truncate to 2 decimal places (~1.1km radius bounding box)
          lat: Math.round(location.approxCoordinates.lat * 100) / 100,
          lng: Math.round(location.approxCoordinates.lng * 100) / 100
        }
      : undefined
  };

  // 4. Generate Unique Request ID
  const uniqueId = `EMG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const newAssistanceRequest = {
    _id: 'req-' + Date.now(),
    requestId: uniqueId,
    idempotencyKey: idempotencyKey || null,
    isGuest: Boolean(isGuest),
    urgency: 'critical_emergency',
    servicesRequested,
    additionalDetails: additionalDetails?.trim() || '',
    location: sanitizedLocation,
    communication: {
      preferredMode: communication.preferredMode,
      contactNumber: communication.contactNumber?.trim() || null,
      safeToCall: Boolean(communication.safeToCall),
      safeToMessage: Boolean(communication.safeToMessage),
      safeTimeWindow: communication.safeTimeWindow || 'Anytime safely',
      preferredLanguage: communication.preferredLanguage || 'English'
    },
    status: 'Submitted',
    matchedOscId: mockOSC._id,
    matchedOscName: mockOSC.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockAssistanceRequests.unshift(newAssistanceRequest);

  // 5. Record initial event in requestEvents collection
  const initialEvent = {
    _id: 'rev-' + Date.now(),
    requestId: uniqueId,
    eventType: 'SUBMITTED',
    actorType: 'victim_guest',
    timestamp: new Date().toISOString(),
    summary: 'Emergency assistance request registered in system. Routed to duty OSC coordinator.'
  };
  mockRequestEvents.unshift(initialEvent);

  // 6. Notify authorized OSC personnel
  const staffNotification = {
    _id: 'notif-' + Date.now(),
    recipientId: 'usr-02',
    type: 'new_referral',
    message: `Immediate emergency request ${uniqueId} logged from ${sanitizedLocation.district}. Services: ${servicesRequested.join(', ')}.`,
    referralOrCaseLink: uniqueId,
    createdAt: new Date().toISOString()
  };
  // Push to internal notifications queue
  if ((global as any).mockNotifications) {
    (global as any).mockNotifications.unshift(staffNotification);
  }

  // 7. Prepare response payload
  const responsePayload = {
    success: true,
    requestId: uniqueId,
    status: 'Submitted',
    services: servicesRequested,
    matchedOsc: {
      centreCode: mockOSC.centreCode,
      name: mockOSC.name,
      helpline: mockOSC.contact.helpline,
      operatingHours: mockOSC.operatingHours
    },
    disclaimer: 'Request registered for confidential OSC case intake. This is not an emergency dispatch service. For ongoing physical violence, dial 112 directly.',
    createdAt: newAssistanceRequest.createdAt
  };

  // Cache for idempotency
  if (idempotencyKey) {
    idempotencyStore.set(idempotencyKey, {
      response: responsePayload,
      timestamp: Date.now()
    });
  }

  return res.status(201).json(responsePayload);
});

// GET /api/victim/emergency-request/:requestId (Track emergency request status & public events)
app.get('/api/victim/emergency-request/:requestId', (req: Request, res: Response) => {
  const { requestId } = req.params;
  const request = mockAssistanceRequests.find(r => r.requestId === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Assistance request not found.' });
  }

  const events = mockRequestEvents.filter(e => e.requestId === requestId);
  return res.json({
    requestId: request.requestId,
    status: request.status,
    servicesRequested: request.servicesRequested,
    matchedOsc: {
      name: request.matchedOscName,
      helpline: mockOSC.contact.helpline
    },
    events,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt
  });
});

// --- SCREEN 3: GENERAL ASSISTANCE REQUEST ENDPOINTS ---
// POST /api/victim/requests
app.post('/api/victim/requests', (req: Request, res: Response) => {
  const {
    idempotencyKey,
    requestType = 'general',
    accessType = 'guest',
    services,
    description,
    location,
    preferences
  } = req.body;

  // 1. Idempotency Check
  if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
    const cached = idempotencyStore.get(idempotencyKey)!;
    if (Date.now() - cached.timestamp < 15 * 60 * 1000) {
      return res.status(200).json({
        ...cached.response,
        isIdempotentReplay: true
      });
    }
  }

  // 2. Validation
  if (!services || !Array.isArray(services) || services.length === 0) {
    return res.status(400).json({
      error: 'Please select at least one assistance service required.'
    });
  }

  const allowedServices = ['shelter', 'medical', 'legal', 'counselling', 'police', 'other'];
  const hasInvalid = services.some(s => !allowedServices.includes(s));
  if (hasInvalid) {
    return res.status(400).json({
      error: 'Invalid service category specified.'
    });
  }

  // Situation description limit (500 chars)
  if (description && description.length > 500) {
    return res.status(400).json({
      error: 'Situation description exceeds maximum 500 characters limit.'
    });
  }

  // Contact preference validation
  const contactMethod = preferences?.preferredContactMethod || 'in_app';
  if (
    (contactMethod === 'phone' || contactMethod === 'sms') &&
    (!preferences?.contactNumber || preferences.contactNumber.trim().length < 10)
  ) {
    return res.status(400).json({
      error: 'A valid 10-digit contact number is required when phone or SMS contact is selected.'
    });
  }

  // Location handling (Coordinates stored ONLY if explicit consent given)
  const consentGiven = Boolean(location?.consentGiven);
  const sanitizedLocation = {
    state: location?.state?.trim() || 'Karnataka',
    district: location?.district?.trim() || 'Bengaluru Urban',
    city: location?.city?.trim() || '',
    locality: location?.locality?.trim() || '',
    consentGiven,
    approxCoordinates: consentGiven && location?.approxCoordinates
      ? {
          lat: Math.round(location.approxCoordinates.lat * 100) / 100,
          lng: Math.round(location.approxCoordinates.lng * 100) / 100
        }
      : undefined
  };

  // Generate unique request reference & secret tracking token
  const year = new Date().getFullYear();
  const requestReference = `REQ-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
  const trackingToken = `TK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const newDoc = {
    _id: 'req-' + Date.now(),
    requestReference,
    trackingToken,
    requestType: 'general',
    accessType: accessType === 'registered' ? 'registered' : 'guest',
    services,
    description: description ? description.trim() : '',
    location: sanitizedLocation,
    preferences: {
      preferredLanguage: preferences?.preferredLanguage || 'English',
      accessibilityNeeds: Array.isArray(preferences?.accessibilityNeeds) ? preferences.accessibilityNeeds : [],
      preferredContactMethod: contactMethod,
      contactNumber: (contactMethod === 'phone' || contactMethod === 'sms') ? preferences.contactNumber.trim() : null,
      safeToCall: Boolean(preferences?.safeToCall),
      safeToMessage: Boolean(preferences?.safeToMessage),
      safeTimeWindow: preferences?.safeTimeWindow || 'Anytime safely'
    },
    status: 'submitted',
    matchedOsc: {
      id: mockOSC._id,
      name: mockOSC.name,
      centreCode: mockOSC.centreCode,
      helpline: mockOSC.contact.helpline,
      operatingHours: mockOSC.operatingHours
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockAssistanceRequests.unshift(newDoc);

  // Record initial event in requestEvents
  const event = {
    _id: 'rev-' + Date.now(),
    requestId: requestReference,
    eventType: 'SUBMITTED',
    actorType: accessType === 'registered' ? 'registered_user' : 'victim_guest',
    timestamp: new Date().toISOString(),
    summary: `Assistance request submitted (${services.join(', ')}). Routed to ${mockOSC.name}.`
  };
  mockRequestEvents.unshift(event);

  const responsePayload = {
    success: true,
    requestReference,
    trackingToken,
    requestType: 'general',
    accessType: newDoc.accessType,
    status: 'submitted',
    services,
    location: {
      state: sanitizedLocation.state,
      district: sanitizedLocation.district,
      city: sanitizedLocation.city,
      consentGiven
    },
    preferences: newDoc.preferences,
    matchedOsc: newDoc.matchedOsc,
    disclaimer: 'Your assistance request has been submitted to One Stop Centre coordinators. This does not automatically reserve shelter beds or dispatch emergency responders. For acute danger, dial 112.',
    createdAt: newDoc.createdAt
  };

  if (idempotencyKey) {
    idempotencyStore.set(idempotencyKey, {
      response: responsePayload,
      timestamp: Date.now()
    });
  }

  return res.status(201).json(responsePayload);
});

// GET /api/victim/requests/:reference (Secure retrieval with token check)
app.get('/api/victim/requests/:reference', (req: Request, res: Response) => {
  const { reference } = req.params;
  const token = req.headers['x-tracking-token'] || req.query.token;

  const found = mockAssistanceRequests.find(
    r => r.requestReference === reference || r.requestId === reference
  );

  if (!found) {
    return res.status(404).json({ error: 'Assistance request not found.' });
  }

  // Security check: Protect sensitive request info; do not expose by predictable ID alone!
  if (found.trackingToken && (!token || token !== found.trackingToken)) {
    return res.status(401).json({
      error: 'Unauthorized: A valid secret tracking token is required to view this assistance request.'
    });
  }

  const events = mockRequestEvents.filter(
    e => e.requestId === reference || e.requestId === found.requestId || e.requestId === found.requestReference
  );

  return res.json({
    requestReference: found.requestReference || found.requestId,
    requestType: found.requestType || 'general',
    accessType: found.accessType || 'guest',
    status: found.status,
    services: found.services || found.servicesRequested,
    description: found.description || '',
    location: {
      district: found.location?.district,
      city: found.location?.city,
      consentGiven: found.location?.consentGiven
    },
    preferences: found.preferences,
    matchedOsc: found.matchedOsc || { name: found.matchedOscName },
    events,
    createdAt: found.createdAt,
    updatedAt: found.updatedAt
  });
});

// --- SCREEN 4: NEARBY OSC DISCOVERY & WEIGHTED RECOMMENDATIONS ---

// Haversine distance calculator in kilometers (rounded to 1 decimal)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Capacity freshness evaluator
function evaluateCapacityStatus(capacity: any) {
  if (!capacity) {
    return {
      status: 'Unverified' as const,
      isStale: true,
      freshnessText: 'Capacity record not found or unverified'
    };
  }

  const updatedTime = new Date(capacity.updatedAt).getTime();
  const ageHours = (Date.now() - updatedTime) / (1000 * 60 * 60);
  const isStale = ageHours > 24;

  if (isStale) {
    return {
      status: 'Unverified' as const,
      isStale: true,
      freshnessText: `Stale data (${Math.round(ageHours / 24)}d ago) — Unverified availability`
    };
  }

  if (capacity.availableBeds <= 0) {
    return {
      status: 'Not Available' as const,
      isStale: false,
      freshnessText: 'Verified within last 24 hours'
    };
  }

  if (capacity.availableBeds <= 3) {
    return {
      status: 'Limited' as const,
      isStale: false,
      freshnessText: 'Verified within last 24 hours'
    };
  }

  return {
    status: 'Available' as const,
    isStale: false,
    freshnessText: 'Verified within last 24 hours'
  };
}

// Service summary generator for any OSC
function getServicesForOscCentre(oscId: string) {
  const capacity = mockCapacities[oscId];
  const hasShelterBeds = capacity && capacity.availableBeds > 0;
  const isSpecializedCentre = oscId === 'osc-del-02'; // South Delhi temporarily 0 shelter beds

  return [
    {
      id: `${oscId}-srv-shelter`,
      serviceType: 'temporary_shelter',
      title: 'Safe Shelter',
      category: 'shelter' as const,
      status: (isSpecializedCentre || !hasShelterBeds ? 'Unavailable' : 'Available') as 'Available' | 'Unavailable',
      operatingHours: '24/7 Continuous Admission',
      notes: isSpecializedCentre ? 'Shelter at full capacity; emergency transit available.' : 'Clean hygiene packs and meals ready.'
    },
    {
      id: `${oscId}-srv-medical`,
      serviceType: 'medical_assistance',
      title: 'Medical Assistance',
      category: 'medical' as const,
      status: 'Available' as const,
      operatingHours: '24/7 On-duty Nurse + Doctor on Call',
      notes: 'Hospital campus linkage; emergency trauma care on standby.'
    },
    {
      id: `${oscId}-srv-legal`,
      serviceType: 'legal_aid',
      title: 'Legal Assistance',
      category: 'legal' as const,
      status: 'Available' as const,
      operatingHours: '10:00 AM – 6:00 PM (Emergency on-call)',
      notes: 'District Legal Services Authority (DLSA) advocate empanelled.'
    },
    {
      id: `${oscId}-srv-counselling`,
      serviceType: 'psychological_counselling',
      title: 'Psychological Counselling',
      category: 'counselling' as const,
      status: 'Available' as const,
      operatingHours: '9:00 AM – 7:00 PM (Trauma care 24/7)',
      notes: 'Trauma-informed certified female counsellors on duty.'
    },
    {
      id: `${oscId}-srv-police`,
      serviceType: 'police_assistance_coordination',
      title: 'Police Assistance',
      category: 'police' as const,
      status: 'Available' as const,
      operatingHours: '24/7 Women Police Liaison Desk',
      notes: 'Dedicated female police liaison for Zero FIR and protection orders.'
    },
    {
      id: `${oscId}-srv-other`,
      serviceType: 'food_and_basic_necessities',
      title: 'Other Support & Rehab',
      category: 'other' as const,
      status: 'Available' as const,
      operatingHours: '24/7 Continuous Provision',
      notes: 'Nutritious food, clothing, Swadhar Greh rehabilitation linkages.'
    }
  ];
}

// Configurable matching weights (Score = 0.30D + 0.30C + 0.30S + 0.10A)
const DEFAULT_MATCHING_WEIGHTS = {
  distance: 0.30,
  capacity: 0.30,
  services: 0.30,
  accessibility: 0.10
};

// 1. GET /api/victim/oscs/filters (Available options for discovery filters)
app.get('/api/victim/oscs/filters', (_req: Request, res: Response) => {
  const states = Array.from(new Set(mockOSCs.map(o => o.state)));
  const districtsByState: Record<string, string[]> = {};
  
  mockOSCs.forEach(o => {
    if (!districtsByState[o.state]) districtsByState[o.state] = [];
    if (!districtsByState[o.state].includes(o.district)) {
      districtsByState[o.state].push(o.district);
    }
  });

  return res.json({
    states,
    districtsByState,
    services: [
      { id: 'shelter', label: 'Safe Shelter' },
      { id: 'medical', label: 'Medical Assistance' },
      { id: 'legal', label: 'Legal Assistance' },
      { id: 'counselling', label: 'Counselling' },
      { id: 'police', label: 'Police Assistance' },
      { id: 'other', label: 'Other Support' }
    ],
    accessibility: [
      { id: 'wheelchair', label: 'Wheelchair / Physical Mobility' },
      { id: 'infant_care', label: 'Infant / Child Care' },
      { id: 'hearing_sign', label: 'Sign Language / Hearing Support' },
      { id: 'elderly_care', label: 'Elderly / Senior Support' },
      { id: 'medical_storage', label: 'Medication Refrigeration' },
      { id: 'ground_floor', label: 'Ground Floor Direct Access' }
    ],
    capacityOptions: [
      { id: 'all', label: 'All Centres' },
      { id: 'available', label: 'Beds Available' },
      { id: 'limited', label: 'Limited Beds (<= 3)' },
      { id: 'unverified', label: 'Unverified / Stale Freshness' }
    ]
  });
});

// 2. GET /api/victim/oscs (Query, filter, sort, and paginate One Stop Centres)
app.get('/api/victim/oscs', (req: Request, res: Response) => {
  const {
    state,
    district,
    search,
    service,
    shelterAvailability,
    accessibility,
    maxDistance,
    sortBy = 'nearest',
    lat,
    lng,
    page = '1',
    limit = '10',
    includeInactive = 'false'
  } = req.query;

  const userLat = lat ? parseFloat(lat as string) : undefined;
  const userLng = lng ? parseFloat(lng as string) : undefined;
  const hasUserCoords = userLat !== undefined && !isNaN(userLat) && userLng !== undefined && !isNaN(userLng);

  const selectedAccessibility = accessibility
    ? (accessibility as string).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Exclude inactive OSCs by default
  let centres = mockOSCs.filter(osc => {
    if (includeInactive === 'true') return true;
    return osc.status === 'active';
  });

  // State filter
  if (state && state !== 'All') {
    centres = centres.filter(osc => osc.state.toLowerCase() === (state as string).toLowerCase());
  }

  // District filter
  if (district && district !== 'All') {
    centres = centres.filter(osc => osc.district.toLowerCase() === (district as string).toLowerCase());
  }

  // Search keyword (name, district, state, general public address)
  if (search && (search as string).trim()) {
    const q = (search as string).toLowerCase().trim();
    centres = centres.filter(osc =>
      osc.name.toLowerCase().includes(q) ||
      osc.district.toLowerCase().includes(q) ||
      osc.state.toLowerCase().includes(q) ||
      osc.address.toLowerCase().includes(q)
    );
  }

  // Build card representation with sanitized public details
  let cardItems = centres.map(osc => {
    const capacityRaw = mockCapacities[osc._id] || {
      totalBeds: 20,
      occupiedBeds: 15,
      unavailableBeds: 0,
      availableBeds: 5,
      updatedAt: new Date().toISOString()
    };
    const evalCap = evaluateCapacityStatus(capacityRaw);
    const servicesList = getServicesForOscCentre(osc._id);

    let distanceKm: number | undefined = undefined;
    if (hasUserCoords) {
      distanceKm = calculateHaversineDistance(userLat!, userLng!, osc.coordinates.lat, osc.coordinates.lng);
    }

    return {
      _id: osc._id,
      id: osc._id,
      name: osc.name,
      centreCode: osc.centreCode,
      district: osc.district,
      state: osc.state,
      address: osc.address, // Public landmark / hospital campus only (never private safehouse address)
      coordinates: osc.coordinates, // Approximate coordinates of hospital campus
      contact: {
        helpline: osc.contact.helpline,
        landline: osc.contact.landline,
        email: osc.contact.email
      },
      operatingHours: osc.operatingHours,
      status: osc.status,
      verificationStatus: osc.verificationStatus,
      distanceKm,
      capacity: {
        totalBeds: capacityRaw.totalBeds,
        occupiedBeds: capacityRaw.occupiedBeds,
        availableBeds: capacityRaw.availableBeds,
        status: evalCap.status,
        isStale: evalCap.isStale,
        updatedAt: capacityRaw.updatedAt,
        freshnessText: evalCap.freshnessText
      },
      services: servicesList,
      accessibilityFacilities: osc.accessibilityFacilities
    };
  });

  // Service filter
  if (service && service !== 'all') {
    cardItems = cardItems.filter(item => {
      const found = item.services.find(s => s.category === service);
      return found && found.status === 'Available';
    });
  }

  // Shelter availability filter
  if (shelterAvailability && shelterAvailability !== 'all') {
    if (shelterAvailability === 'available') {
      cardItems = cardItems.filter(item => item.capacity.status === 'Available');
    } else if (shelterAvailability === 'limited') {
      cardItems = cardItems.filter(item => item.capacity.status === 'Limited');
    } else if (shelterAvailability === 'not_available') {
      cardItems = cardItems.filter(item => item.capacity.status === 'Not Available');
    } else if (shelterAvailability === 'unverified') {
      cardItems = cardItems.filter(item => item.capacity.isStale);
    }
  }

  // Accessibility facilities filter
  if (selectedAccessibility.length > 0) {
    cardItems = cardItems.filter(item =>
      selectedAccessibility.every(accId => item.accessibilityFacilities.includes(accId))
    );
  }

  // Distance range filter
  if (maxDistance) {
    const maxD = parseFloat(maxDistance as string);
    if (!isNaN(maxD)) {
      cardItems = cardItems.filter(item => item.distanceKm !== undefined && item.distanceKm <= maxD);
    }
  }

  // Sorting
  if (sortBy === 'nearest') {
    cardItems.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== undefined) return -1;
      if (b.distanceKm !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });
  } else if (sortBy === 'availability') {
    cardItems.sort((a, b) => b.capacity.availableBeds - a.capacity.availableBeds);
  } else if (sortBy === 'best_match') {
    cardItems.sort((a, b) => {
      // Prioritize verified availability, then distance
      const aFresh = !a.capacity.isStale ? 1 : 0;
      const bFresh = !b.capacity.isStale ? 1 : 0;
      if (aFresh !== bFresh) return bFresh - aFresh;
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return b.capacity.availableBeds - a.capacity.availableBeds;
    });
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
  const total = cardItems.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const paginated = cardItems.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    oscs: paginated,
    total,
    page: pageNum,
    totalPages,
    appliedFilters: {
      state: state || 'All',
      district: district || 'All',
      service: service || 'all',
      shelterAvailability: shelterAvailability || 'all',
      accessibility: selectedAccessibility,
      sortBy
    }
  });
});

// 3. GET /api/victim/oscs/:id (Detailed public profile for One Stop Centre)
app.get('/api/victim/oscs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const osc = mockOSCs.find(o => o._id === id || o.centreCode === id);

  if (!osc) {
    return res.status(404).json({ error: 'One Stop Centre not found.' });
  }

  const capacityRaw = mockCapacities[osc._id] || {
    totalBeds: 20,
    occupiedBeds: 15,
    unavailableBeds: 0,
    availableBeds: 5,
    updatedAt: new Date().toISOString()
  };
  const evalCap = evaluateCapacityStatus(capacityRaw);
  const servicesList = getServicesForOscCentre(osc._id);

  // Sanitized details (never expose private safehouse address or confidential staff personal info)
  return res.json({
    _id: osc._id,
    name: osc.name,
    centreCode: osc.centreCode,
    district: osc.district,
    state: osc.state,
    address: osc.address,
    coordinates: osc.coordinates,
    contact: {
      helpline: osc.contact.helpline,
      landline: osc.contact.landline,
      email: osc.contact.email
    },
    operatingHours: osc.operatingHours,
    status: osc.status,
    verificationStatus: osc.verificationStatus,
    capacity: {
      totalBeds: capacityRaw.totalBeds,
      occupiedBeds: capacityRaw.occupiedBeds,
      unavailableBeds: capacityRaw.unavailableBeds || 0,
      availableBeds: capacityRaw.availableBeds,
      status: evalCap.status,
      isStale: evalCap.isStale,
      updatedAt: capacityRaw.updatedAt,
      freshnessText: evalCap.freshnessText
    },
    services: servicesList,
    accessibilityFacilities: osc.accessibilityFacilities
  });
});

// 4. GET /api/victim/requests/:id/recommendations (Weighted matching algorithm for Screen 3 requests)
app.get('/api/victim/requests/:id/recommendations', (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.headers['x-tracking-token'] as string;

  // Find assistance request
  const request = mockAssistanceRequests.find(
    r => r.requestId === id || r.requestReference === id || (r as any)._id === id
  );

  if (!request) {
    return res.status(404).json({ error: 'Assistance request not found for generating recommendations.' });
  }

  // Token validation if request is protected
  if (request.trackingToken && token && token !== request.trackingToken) {
    return res.status(401).json({ error: 'Unauthorized: Invalid tracking token.' });
  }

  const requestedServices: string[] = request.services || request.servicesRequested || [];
  const requestedAccessibility: string[] = request.preferences?.accessibilityNeeds || [];
  const userDistrict = request.location?.district;
  const userState = request.location?.state;
  const userCoords = request.location?.approxCoordinates;

  const eligibleCentres: any[] = [];

  for (const osc of mockOSCs) {
    // Hard Rule 1: Exclude inactive OSCs
    if (osc.status !== 'active') {
      continue;
    }

    const servicesList = getServicesForOscCentre(osc._id);
    const capacityRaw = mockCapacities[osc._id] || {
      totalBeds: 20,
      occupiedBeds: 15,
      unavailableBeds: 0,
      availableBeds: 5,
      updatedAt: new Date().toISOString()
    };
    const evalCap = evaluateCapacityStatus(capacityRaw);

    // Hard Rule 2: Exclude centres without mandatory requested services
    const missingService = requestedServices.find(reqSrv => {
      const srv = servicesList.find(s => s.category === reqSrv);
      return !srv || srv.status !== 'Available';
    });

    if (missingService) {
      continue; // Centre lacks a mandatory requested service -> Not eligible
    }

    // Hard Rule 3: Do not recommend a centre for shelter when verified capacity is zero
    if (requestedServices.includes('shelter') && capacityRaw.availableBeds <= 0) {
      continue;
    }

    // --- WEIGHTED SCORING: Score = 0.30D + 0.30C + 0.30S + 0.10A ---

    // 1. Distance suitability (D)
    let distanceKm: number | undefined = undefined;
    let distanceScore = 0.2; // default fallback

    if (userCoords && userCoords.lat && userCoords.lng) {
      distanceKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, osc.coordinates.lat, osc.coordinates.lng);
      if (distanceKm < 5) distanceScore = 1.0;
      else if (distanceKm < 15) distanceScore = 0.8;
      else if (distanceKm < 30) distanceScore = 0.6;
      else if (distanceKm < 60) distanceScore = 0.4;
      else distanceScore = 0.2;
    } else if (userDistrict && osc.district.toLowerCase() === userDistrict.toLowerCase()) {
      distanceScore = 0.85;
    } else if (userState && osc.state.toLowerCase() === userState.toLowerCase()) {
      distanceScore = 0.50;
    }

    // 2. Verified capacity availability (C)
    let capacityScore = 0.0;
    if (evalCap.isStale) {
      // Rule: Mark stale capacity data as unverified. Do not treat unverified as confirmed.
      capacityScore = 0.30;
    } else if (capacityRaw.availableBeds >= 5) {
      capacityScore = 1.0;
    } else if (capacityRaw.availableBeds > 0) {
      capacityScore = 0.70;
    } else {
      capacityScore = 0.0;
    }

    // 3. Requested service compatibility (S)
    let serviceScore = 1.0;
    if (requestedServices.length > 0) {
      const availableMatched = requestedServices.filter(reqSrv => {
        const found = servicesList.find(s => s.category === reqSrv);
        return found && found.status === 'Available';
      }).length;
      serviceScore = availableMatched / requestedServices.length;
    }

    // 4. Accessibility compatibility (A)
    let accessibilityScore = 1.0;
    if (requestedAccessibility.length > 0) {
      const matched = requestedAccessibility.filter(acc => osc.accessibilityFacilities.includes(acc)).length;
      accessibilityScore = matched / requestedAccessibility.length;
    }

    // Combined Weighted Score
    const totalScore = Number((
      DEFAULT_MATCHING_WEIGHTS.distance * distanceScore +
      DEFAULT_MATCHING_WEIGHTS.capacity * capacityScore +
      DEFAULT_MATCHING_WEIGHTS.services * serviceScore +
      DEFAULT_MATCHING_WEIGHTS.accessibility * accessibilityScore
    ).toFixed(3));

    const matchPercentage = Math.round(totalScore * 100);

    // Explain why this centre is recommended
    const explanationParts: string[] = [];
    if (requestedServices.length > 0) {
      explanationParts.push(`Matches all ${requestedServices.length} requested services`);
    }
    if (evalCap.isStale) {
      explanationParts.push('Capacity is unverified (>24h)');
    } else if (capacityRaw.availableBeds > 0) {
      explanationParts.push(`${capacityRaw.availableBeds} verified beds available`);
    }
    if (distanceKm !== undefined) {
      explanationParts.push(`${distanceKm} km away`);
    } else if (userDistrict && osc.district.toLowerCase() === userDistrict.toLowerCase()) {
      explanationParts.push(`In your district (${osc.district})`);
    }
    if (requestedAccessibility.length > 0 && accessibilityScore === 1.0) {
      explanationParts.push('Full accessibility support');
    }

    eligibleCentres.push({
      _id: osc._id,
      id: osc._id,
      name: osc.name,
      centreCode: osc.centreCode,
      district: osc.district,
      state: osc.state,
      address: osc.address,
      coordinates: osc.coordinates,
      contact: {
        helpline: osc.contact.helpline,
        landline: osc.contact.landline,
        email: osc.contact.email
      },
      operatingHours: osc.operatingHours,
      status: osc.status,
      verificationStatus: osc.verificationStatus,
      distanceKm,
      capacity: {
        totalBeds: capacityRaw.totalBeds,
        occupiedBeds: capacityRaw.occupiedBeds,
        availableBeds: capacityRaw.availableBeds,
        status: evalCap.status,
        isStale: evalCap.isStale,
        updatedAt: capacityRaw.updatedAt,
        freshnessText: evalCap.freshnessText
      },
      services: servicesList,
      accessibilityFacilities: osc.accessibilityFacilities,
      recommendation: {
        score: totalScore,
        matchPercentage,
        breakdown: {
          distanceScore,
          capacityScore,
          serviceScore,
          accessibilityScore
        },
        explanation: explanationParts.join(' · '),
        isEligible: true
      }
    });
  }

  // Sort by weighted recommendation score descending
  eligibleCentres.sort((a, b) => b.recommendation.score - a.recommendation.score);

  return res.json({
    requestReference: request.requestReference || request.requestId,
    requestedServices,
    requestedAccessibility,
    userLocation: {
      district: userDistrict,
      state: userState,
      approxCoordinates: userCoords
    },
    matchingWeights: DEFAULT_MATCHING_WEIGHTS,
    totalEligible: eligibleCentres.length,
    recommendations: eligibleCentres
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    module: 'SakhiLink Full-Stack Server',
    oscCentre: mockOSC.centreCode,
    collections: 13,
    emergencyRequestsActive: mockAssistanceRequests.length
  });
});

/* --- Vite Middlewares Setup --- */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SakhiLink Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
