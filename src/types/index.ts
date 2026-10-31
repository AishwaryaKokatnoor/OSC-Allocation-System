export type ServiceType = 
  | 'shelter'
  | 'medical'
  | 'legal'
  | 'counselling'
  | 'police'
  | 'other';

export interface ServiceItem {
  id: ServiceType;
  title: string;
  shortDesc: string;
  detailedDesc: string;
  iconName: string;
  availability: '24/7 Available' | 'On-Call & Walk-in' | 'Immediate Response';
  typicalSupport: string[];
}

export interface OSCCentre {
  id: string;
  name: string;
  district: string;
  state: string;
  address: string;
  helpline: string;
  landline: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  servicesAvailable: ServiceType[];
  operatingHours: string;
  isVerified: boolean;
  distanceKm?: number;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface AssistanceRequestPayload {
  selectedService: ServiceType;
  preferredContactMethod: 'phone' | 'whatsapp' | 'sms' | 'in_person_only';
  contactNumber?: string;
  safeTimeToCall?: string;
  isGuest: boolean;
  guestName?: string;
  district?: string;
  state?: string;
  notes?: string;
  urgency: 'routine' | 'urgent' | 'critical';
  needShelter: boolean;
}
