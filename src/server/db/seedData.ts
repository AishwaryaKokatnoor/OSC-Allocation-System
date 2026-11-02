import { CURRENT_OSC, INITIAL_CAPACITY, INITIAL_SERVICES, INITIAL_REFERRALS, INITIAL_CASES, INITIAL_CASE_NOTES, INITIAL_FOLLOW_UPS, INITIAL_NOTIFICATIONS, INITIAL_STAFF } from '../../data/oscMockData';
import { MOCK_OSC_CENTRES } from '../../data/mockData';
import bcrypt from 'bcryptjs';

export async function getSeedData() {
  const passwordHash = await bcrypt.hash('SakhiLink2026!', 10);

  const seededUsers = INITIAL_STAFF.map(u => ({
    ...u,
    _id: u._id,
    passwordHash,
    active: true
  }));

  // Add primary demo manager and caseworker
  seededUsers.push({
    _id: 'usr-01',
    name: 'Ananya Deshmukh',
    email: 'manager.bangalore@sakhi.gov.in',
    passwordHash,
    role: 'centre_manager' as any,
    oscId: 'osc-ka-blr-01',
    phone: '+91 98450 11200',
    badgeId: 'OSC-MGR-01',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  } as any);

  seededUsers.push({
    _id: 'usr-02',
    name: 'Priya Sharma',
    email: 'priya.case@sakhi.gov.in',
    passwordHash,
    role: 'case_manager' as any,
    oscId: 'osc-ka-blr-01',
    phone: '+91 98450 11201',
    badgeId: 'OSC-CSW-04',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  } as any);

  return {
    users: seededUsers,
    oscs: [CURRENT_OSC, ...MOCK_OSC_CENTRES.map(c => ({
      _id: c.id,
      centreCode: c.id.toUpperCase(),
      name: c.name,
      district: c.district,
      state: c.state,
      address: c.address,
      coordinates: { lat: 12.9716, lng: 77.5946 },
      helpline: c.helpline,
      landline: c.landline,
      operatingHours: c.operatingHours,
      verified: c.isVerified,
      servicesOffered: ['Safe Shelter', 'Medical Assistance', 'Legal Counselling', 'Police Assistance', 'Psychological Support'],
      accessibilityFeatures: ['Wheelchair Ramps', 'Ground Floor Beds', 'Sign Language Support'],
      intakeCapacity: {
        totalBeds: c.totalBeds,
        currentAvailableBeds: c.availableBeds
      }
    }))],
    capacity: [INITIAL_CAPACITY],
    services: INITIAL_SERVICES,
    referrals: INITIAL_REFERRALS,
    cases: INITIAL_CASES,
    caseNotes: INITIAL_CASE_NOTES,
    followUps: INITIAL_FOLLOW_UPS,
    notifications: INITIAL_NOTIFICATIONS
  };
}
