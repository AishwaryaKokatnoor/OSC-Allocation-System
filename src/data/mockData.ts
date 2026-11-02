import { ServiceItem, OSCCentre, LanguageOption } from '../types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'shelter',
    title: 'Safe Shelter',
    shortDesc: 'Immediate short-term secure accommodation with food, hygiene supplies, and 24/7 security protection.',
    detailedDesc: 'One Stop Centres provide temporary safe shelter for women and children in acute distress or fleeing violence. Accommodation includes safe sleeping quarters, meals, essential clothing, sanitary products, and strict security protection.',
    iconName: 'Home',
    availability: '24/7 Available',
    typicalSupport: [
      'Temporary stay for up to 5 days (extended per assessment)',
      'Clean bedding, daily nutritious meals, and clean water',
      'Safe environment for children accompanying the mother',
      'Round-the-clock female security personnel'
    ]
  },
  {
    id: 'medical',
    title: 'Medical Assistance',
    shortDesc: 'First aid, forensic medical examination, trauma treatment, and hospital admission coordination.',
    detailedDesc: 'Immediate medical evaluation by certified doctors. Includes treatment for injuries, post-trauma care, emergency contraception, HIV prophylaxis when indicated, and medico-legal documentation compliant with legal evidentiary standards.',
    iconName: 'Stethoscope',
    availability: 'Immediate Response',
    typicalSupport: [
      'Emergency first aid and acute wound management',
      'Referral and ambulance coordination to district hospital',
      'Confidential forensic and medico-legal examination',
      'Psychological trauma evaluation alongside physical care'
    ]
  },
  {
    id: 'legal',
    title: 'Legal Assistance',
    shortDesc: 'Free legal aid, counsel from certified advocates, FIR facilitation, and court proceeding guidance.',
    detailedDesc: 'Access to empanelled lawyers and District Legal Services Authority (DLSA) representatives. Receive guidance on domestic violence protection orders, maintenance, child custody, divorce proceedings, and criminal legal processes.',
    iconName: 'Scale',
    availability: 'On-Call & Walk-in',
    typicalSupport: [
      'Empanelled female lawyers for legal advice',
      'Assistance in filing applications under PWDVA (Domestic Violence Act)',
      'Free representation through District Legal Services Authority (DLSA)',
      'Court date accompaniment and legal rights clarification'
    ]
  },
  {
    id: 'counselling',
    title: 'Counselling',
    shortDesc: 'Confidential psychosocial counselling, trauma care, and mental health support by trained professionals.',
    detailedDesc: 'Trauma-informed, compassionate psychological support to process shock, fear, anxiety, and grief. Dedicated female counsellors assist in emotional stabilizing, safety planning, and building resilience in an affirming space.',
    iconName: 'HeartHandshake',
    availability: '24/7 Available',
    typicalSupport: [
      'One-on-one trauma-informed psychological sessions',
      'Personalized safety planning for home and transit',
      'Empowerment-focused crisis de-escalation',
      'Long-term telephonic follow-up sessions available'
    ]
  },
  {
    id: 'police',
    title: 'Police Assistance',
    shortDesc: 'Facilitation of police complaints, zero-FIR filing, and protection orders through OSC police liaison.',
    detailedDesc: 'Direct liaison with dedicated female police officers assigned to the One Stop Centre. File police complaints, register Zero FIRs (independent of jurisdiction), and request urgent protection without enduring intimidating police station environments.',
    iconName: 'ShieldAlert',
    availability: 'Immediate Response',
    typicalSupport: [
      'Direct coordination with Women Police Officers at the centre',
      'Zero FIR registration without jurisdictional barriers',
      'Police protection orders for residence or workplace',
      'Transparent tracking of complaint status and investigation'
    ]
  },
  {
    id: 'other',
    title: 'Other Support',
    shortDesc: 'Rehabilitation guidance, vocational training linkage, and government welfare scheme enrollment.',
    detailedDesc: 'Holistic rehabilitation support including linkage with Swadhar Greh, Ujjawala schemes, skill development initiatives, education support, and socio-economic reintegration assistance to ensure sustainable independence.',
    iconName: 'HandHeart',
    availability: 'On-Call & Walk-in',
    typicalSupport: [
      'Linkage to vocational training and skill development',
      'Referral to long-term government rehabilitation homes',
      'Facilitation of identity documents (Aadhaar, Ration, Bank)',
      'Access to state victim compensation schemes'
    ]
  }
];

export const MOCK_OSC_CENTRES: OSCCentre[] = [
  {
    id: 'osc-del-01',
    name: 'Sakhi One Stop Centre, Central Delhi',
    district: 'Central Delhi',
    state: 'Delhi',
    address: 'Near District Hospital Compound, Daryaganj, New Delhi - 110002',
    helpline: '181 / 011-23274501',
    landline: '011-23274502',
    totalBeds: 20,
    occupiedBeds: 12,
    availableBeds: 8,
    servicesAvailable: ['shelter', 'medical', 'legal', 'counselling', 'police', 'other'],
    operatingHours: '24 Hours / 7 Days a Week',
    isVerified: true,
    distanceKm: 3.2
  },
  {
    id: 'osc-blr-01',
    name: 'Sakhi One Stop Centre, Bengaluru Urban',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    address: 'Bowring and Lady Curzon Hospital Campus, Shivajinagar, Bengaluru - 560001',
    helpline: '181 / 080-22867540',
    landline: '080-22867541',
    totalBeds: 25,
    occupiedBeds: 16,
    availableBeds: 9,
    servicesAvailable: ['shelter', 'medical', 'legal', 'counselling', 'police', 'other'],
    operatingHours: '24 Hours / 7 Days a Week',
    isVerified: true,
    distanceKm: 4.8
  },
  {
    id: 'osc-mum-01',
    name: 'Sakhi One Stop Centre, Mumbai Suburban',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    address: 'K.B. Bhabha Hospital Grounds, Bandra West, Mumbai - 400050',
    helpline: '181 / 022-26422775',
    landline: '022-26422776',
    totalBeds: 30,
    occupiedBeds: 21,
    availableBeds: 9,
    servicesAvailable: ['shelter', 'medical', 'legal', 'counselling', 'police', 'other'],
    operatingHours: '24 Hours / 7 Days a Week',
    isVerified: true,
    distanceKm: 6.5
  },
  {
    id: 'osc-hyd-01',
    name: 'Sakhi One Stop Centre, Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    address: 'Government Maternity Hospital Premises, Petlaburj, Hyderabad - 500002',
    helpline: '181 / 040-24528181',
    landline: '040-24528182',
    totalBeds: 18,
    occupiedBeds: 11,
    availableBeds: 7,
    servicesAvailable: ['shelter', 'medical', 'legal', 'counselling', 'police', 'other'],
    operatingHours: '24 Hours / 7 Days a Week',
    isVerified: true,
    distanceKm: 5.1
  },
  {
    id: 'osc-kol-01',
    name: 'Sakhi One Stop Centre, Kolkata South',
    district: 'Kolkata',
    state: 'West Bengal',
    address: 'M.R. Bangur Hospital Campus, Tollygunge, Kolkata - 700033',
    helpline: '181 / 033-24733901',
    landline: '033-24733902',
    totalBeds: 22,
    occupiedBeds: 14,
    availableBeds: 8,
    servicesAvailable: ['shelter', 'medical', 'legal', 'counselling', 'police', 'other'],
    operatingHours: '24 Hours / 7 Days a Week',
    isVerified: true,
    distanceKm: 7.0
  },
  {
    id: 'osc-chn-01',
    name: 'Sakhi One Stop Centre, Chennai Central',
    district: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Government Kasturba Gandhi Hospital Campus, Triplicane, Chennai - 600005',
    helpline: '181 / 044-28441112',
    landline: '044-28441113',
    totalBeds: 24,
    occupiedBeds: 15,
    availableBeds: 9,
    servicesAvailable: ['shelter', 'medical', 'legal', 'counselling', 'police', 'other'],
    operatingHours: '24 Hours / 7 Days a Week',
    isVerified: true,
    distanceKm: 8.3
  }
];

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
];

export const EMERGENCY_NUMBERS = [
  {
    number: '112',
    title: 'National Emergency',
    desc: 'All-in-one 24/7 emergency dispatch (Police, Fire, Ambulance)',
    primary: true
  },
  {
    number: '181',
    title: 'Women Helpline',
    desc: 'Toll-free 24/7 dedicated support for women in distress',
    primary: true
  },
  {
    number: '1091',
    title: 'Women in Distress',
    desc: 'Police Women Safety emergency response line',
    primary: false
  },
  {
    number: '1098',
    title: 'Childline',
    desc: 'Immediate protection and care for accompanying minors',
    primary: false
  },
  {
    number: '7827170170',
    title: 'NCW Helpline',
    desc: 'National Commission for Women 24/7 domestic violence line',
    primary: false
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Tell Us What You Need',
    desc: 'Select the exact assistance you require—shelter, medical, legal, or counselling. You can proceed 100% anonymously as a guest with no signup required.'
  },
  {
    number: '02',
    title: 'Find Suitable OSCs',
    desc: 'Locate verified government One Stop Centres in your district with confirmed live bed availability, facility verification, and direct phone lines.'
  },
  {
    number: '03',
    title: 'Get Connected Safely',
    desc: 'Receive immediate confidential case coordination, safe walk-in directions, or discreet callback from trained female caseworkers at your chosen time.'
  }
];

export const PRIVACY_PILLARS = [
  {
    id: 'guest-access',
    icon: 'UserCheck',
    title: 'Guest Access by Default',
    desc: 'Never requires mandatory registration, email, or Aadhaar to view resources, locate centres, or initiate an assistance request.'
  },
  {
    id: 'optional-info',
    icon: 'EyeOff',
    title: 'Optional Personal Information',
    desc: 'You choose how much to disclose. Aliases or pseudonyms are completely accepted; your safety and comfort dictate the pace.'
  },
  {
    id: 'consent-location',
    icon: 'MapPinOff',
    title: 'Consent-Based Location Sharing',
    desc: 'SakhiLink NEVER requests or tracks your GPS location automatically. You manually select your district, or tap to share only with explicit consent.'
  },
  {
    id: 'authorized-access',
    icon: 'Lock',
    title: 'Strict Authorized Access',
    desc: 'Case records and referral information are restricted exclusively to verified government OSC case managers under strict privacy laws.'
  }
];

export const FAQS = [
  {
    question: 'What is a Sakhi One Stop Centre (OSC)?',
    answer: 'A One Stop Centre (popularly known as Sakhi Centre) is an initiative by the Ministry of Women and Child Development, Government of India. It provides integrated support and assistance under one roof to women affected by violence, including medical aid, legal aid, shelter, police facilitation, and psychological counselling.'
  },
  {
    question: 'Is there any fee or charge for services at Sakhi Centres?',
    answer: 'No. All services provided at One Stop Centres—including shelter, food, medical attention, legal assistance, and counselling—are 100% free of cost, funded by the Government of India under the Nirbhaya Fund.'
  },
  {
    question: 'Can I bring my children with me to the shelter?',
    answer: 'Yes. Girls of all ages and boys up to 12 years of age can stay with their mother at the One Stop Centre shelter. The centre coordinates meals and necessary provisions for accompanying children.'
  },
  {
    question: 'Is my identity protected when I reach out?',
    answer: 'Yes. You can use any name or alias you feel safe with. We never require Aadhaar, voter ID, or login to request shelter or speak with an OSC caseworker. Your privacy and physical safety are our highest priorities.'
  },
  {
    question: 'Do I have to register a police case (FIR) to get shelter or medical help?',
    answer: 'No. Filing a police complaint is entirely your choice. You can receive safe shelter, medical treatment, and trauma counselling even if you decide not to file an FIR or press charges.'
  }
];
