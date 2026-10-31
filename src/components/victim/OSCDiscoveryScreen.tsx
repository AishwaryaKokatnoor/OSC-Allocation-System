import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Shield,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Navigation,
  Search,
  Filter,
  SlidersHorizontal,
  Home,
  Stethoscope,
  Scale,
  HeartHandshake,
  Check,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  Sparkles,
  Bed,
  Layers,
  ChevronDown,
  X,
  RefreshCw,
  Info,
  Maximize2,
  Minimize2,
  Map as MapIcon,
  List as ListIcon,
  Building2,
  ArrowRight,
  Accessibility,
  Compass
} from 'lucide-react';
import {
  OSCDiscoveryCardItem,
  OSCFilterOptions,
  AssistanceServiceCategory,
  OSCCapacityStatus
} from '../../types/database';
import { apiClient } from '../../services/api';

interface Props {
  initialRequestReference?: string;
  initialTrackingToken?: string;
  onBackToAssistanceRequest: () => void;
  onQuickExit: () => void;
  onGoToEmergency: () => void;
  onSelectCentre: (centre: OSCDiscoveryCardItem, requestReference?: string) => void;
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shelter: Home,
  medical: Stethoscope,
  legal: Scale,
  counselling: HeartHandshake,
  police: ShieldAlert,
  other: Building2
};

export const OSCDiscoveryScreen: React.FC<Props> = ({
  initialRequestReference,
  initialTrackingToken,
  onBackToAssistanceRequest,
  onQuickExit,
  onGoToEmergency,
  onSelectCentre
}) => {
  // Mobile tab mode: 'list' or 'map'
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Request & Recommendation state
  const [requestReference, setRequestReference] = useState<string | undefined>(initialRequestReference);
  const [trackingToken] = useState<string | undefined>(initialTrackingToken);
  const [recommendationsData, setRecommendationsData] = useState<any | null>(null);
  const [isRecommendationMode, setIsRecommendationMode] = useState<boolean>(Boolean(initialRequestReference));

  // Centres & Loading state
  const [centres, setCentres] = useState<OSCDiscoveryCardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState<OSCFilterOptions | null>(null);

  // Active Filter Controls
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [shelterAvailability, setShelterAvailability] = useState<string>('all');
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'nearest' | 'best_match' | 'availability'>('best_match');

  // Location / GPS Consent state
  const [hasLocationConsent, setHasLocationConsent] = useState<boolean>(false);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  // Selected Centre for Interactive Map / Modal
  const [selectedCentreId, setSelectedCentreId] = useState<string | null>(null);
  const [detailedModalCentre, setDetailedModalCentre] = useState<OSCDiscoveryCardItem | null>(null);

  // Map viewport states
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Initial Load: Fetch filter metadata and centres
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const filtersRes = await apiClient.getOSCFilters();
        setFilterOptions(filtersRes);

        // If request reference was supplied from Screen 3, fetch personalized recommendations
        if (requestReference) {
          try {
            const recRes = await apiClient.getOSCRecommendations(requestReference, trackingToken);
            setRecommendationsData(recRes);
            if (recRes.recommendations && recRes.recommendations.length > 0) {
              setCentres(recRes.recommendations);
              setIsRecommendationMode(true);
              if (recRes.userLocation?.district) {
                setSelectedDistrict(recRes.userLocation.district);
              }
              if (recRes.userLocation?.state) {
                setSelectedState(recRes.userLocation.state);
              }
              if (recRes.userLocation?.approxCoordinates) {
                setUserCoordinates(recRes.userLocation.approxCoordinates);
                setHasLocationConsent(true);
              }
              setIsLoading(false);
              return;
            }
          } catch (recErr) {
            console.warn('Could not load specific recommendations, falling back to general search', recErr);
          }
        }

        // Standard OSC fetch
        await fetchCentres();
      } catch (err: any) {
        setErrorMessage(err.message || 'Unable to connect to One Stop Centre registry. Please check connection.');
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [requestReference]);

  // Fetch Centres with current active filters
  const fetchCentres = async (customParams?: any) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params: any = {
        state: customParams?.state !== undefined ? customParams.state : selectedState,
        district: customParams?.district !== undefined ? customParams.district : selectedDistrict,
        search: customParams?.search !== undefined ? customParams.search : searchQuery,
        service: customParams?.service !== undefined ? customParams.service : selectedService,
        shelterAvailability: customParams?.shelterAvailability !== undefined ? customParams.shelterAvailability : shelterAvailability,
        accessibility: customParams?.accessibility !== undefined ? customParams.accessibility : selectedAccessibility,
        maxDistance: customParams?.maxDistance !== undefined ? customParams.maxDistance : maxDistanceKm,
        sortBy: customParams?.sortBy !== undefined ? customParams.sortBy : sortBy,
        lat: userCoordinates?.lat,
        lng: userCoordinates?.lng
      };

      const res = await apiClient.getOSCs(params);
      setCentres(res.oscs || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating centre listings.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when primary filters or coordinates change
  const handleApplyFilter = () => {
    setIsRecommendationMode(false);
    fetchCentres();
  };

  // Explicit GPS Consent trigger
  const handleRequestGPS = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser. Please select your district manually.');
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const approxLat = Math.round(pos.coords.latitude * 100) / 100;
        const approxLng = Math.round(pos.coords.longitude * 100) / 100;
        setUserCoordinates({ lat: approxLat, lng: approxLng });
        setHasLocationConsent(true);
        setLocationNotice('Approximate location captured with your explicit consent (~1.1km radius). Exact address coordinates are never shared.');
        
        // Auto-refresh search with user coordinates
        apiClient.getOSCs({
          state: selectedState,
          district: selectedDistrict,
          lat: approxLat,
          lng: approxLng,
          sortBy: 'nearest'
        }).then(res => {
          setCentres(res.oscs || []);
          setSortBy('nearest');
        }).catch(() => {});
      },
      (err) => {
        setIsLocating(false);
        setHasLocationConsent(false);
        setLocationNotice(`Location access was declined (${err.message}). You can comfortably choose your state and district from the filters.`);
      },
      { timeout: 8000 }
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedState('All');
    setSelectedDistrict('All');
    setSearchQuery('');
    setSelectedService('all');
    setShelterAvailability('all');
    setSelectedAccessibility([]);
    setMaxDistanceKm(undefined);
    setSortBy('best_match');
    setIsRecommendationMode(false);
    fetchCentres({
      state: 'All',
      district: 'All',
      search: '',
      service: 'all',
      shelterAvailability: 'all',
      accessibility: [],
      maxDistance: undefined,
      sortBy: 'best_match'
    });
  };

  // Toggle accessibility filter tag
  const handleToggleAccessibility = (tagId: string) => {
    const updated = selectedAccessibility.includes(tagId)
      ? selectedAccessibility.filter(id => id !== tagId)
      : [...selectedAccessibility, tagId];
    setSelectedAccessibility(updated);
  };

  // Map bounding coordinates calculation
  const mapBounds = useMemo(() => {
    if (centres.length === 0) {
      return { minLat: 12.0, maxLat: 29.0, minLng: 72.0, maxLng: 89.0 };
    }
    const lats = centres.map(c => c.coordinates.lat);
    const lngs = centres.map(c => c.coordinates.lng);
    if (userCoordinates) {
      lats.push(userCoordinates.lat);
      lngs.push(userCoordinates.lng);
    }
    return {
      minLat: Math.min(...lats) - 0.2,
      maxLat: Math.max(...lats) + 0.2,
      minLng: Math.min(...lngs) - 0.3,
      maxLng: Math.max(...lngs) + 0.3
    };
  }, [centres, userCoordinates]);

  // Convert lat/lng to SVG percentage coordinates
  const projectCoordinates = (lat: number, lng: number) => {
    const { minLat, maxLat, minLng, maxLng } = mapBounds;
    const latSpan = Math.max(0.1, maxLat - minLat);
    const lngSpan = Math.max(0.1, maxLng - minLng);

    // SVG: x goes 0 -> 100% (left to right), y goes 0 -> 100% (top to bottom, inverted lat)
    const x = ((lng - minLng) / lngSpan) * 88 + 6;
    const y = ((maxLat - lat) / latSpan) * 82 + 9;
    return { x: Math.min(94, Math.max(6, x)), y: Math.min(92, Math.max(8, y)) };
  };

  // Highlighted card ref
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSelectMarker = (oscId: string) => {
    setSelectedCentreId(oscId);
    if (viewMode === 'list' && cardRefs.current[oscId]) {
      cardRefs.current[oscId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const selectedCentre = useMemo(() => {
    return centres.find(c => c._id === selectedCentreId) || null;
  }, [centres, selectedCentreId]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1F2937] font-sans pb-20">
      
      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D0DDD0] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Back button */}
          <button
            onClick={onBackToAssistanceRequest}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#F4F7F4] border border-transparent hover:border-[#D0DDD0] transition-colors"
            aria-label="Back to Assistance Request"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Assistance Request</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Title and Subtitle */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-sm sm:text-base font-extrabold text-[#1F2937] tracking-tight">
              Nearby One Stop Centres
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#52606D] truncate max-w-[210px] sm:max-w-none">
              Find support centres that may be able to help
            </p>
          </div>

          {/* Quick Exit */}
          <div className="relative group">
            <button
              onClick={onQuickExit}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
              title="Immediately leaves to a neutral website. Note: Does not erase browser history."
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Quick Exit</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg pointer-events-none z-50">
              Leaves instantly to Google. <span className="text-amber-300">Does not erase browser history.</span>
            </div>
          </div>

        </div>

        {/* Emergency Callout Strip */}
        <div className="bg-red-50 border-t border-b border-red-200/80 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-red-950">
            <div className="flex items-center gap-2 truncate">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="truncate">
                In acute danger? Dial India <strong>112</strong> immediately. SakhiLink does not dispatch responders.
              </span>
            </div>
            <button
              onClick={onGoToEmergency}
              className="shrink-0 text-xs font-bold text-red-700 hover:underline flex items-center gap-1 ml-2"
            >
              <span>Emergency Screen</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Request Context Matching Banner (when arriving from Screen 3) */}
        {recommendationsData && (
          <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Request Active: {recommendationsData.requestReference}
                </span>
                <span className="text-xs text-emerald-900 font-semibold">
                  Personalized Weighted Recommendations
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-snug">
                Showing centres ranked by suitability for your requested services (
                <strong>{recommendationsData.requestedServices.join(', ')}</strong>), verified capacity, and safe location.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (isRecommendationMode) {
                    setIsRecommendationMode(false);
                    fetchCentres();
                  } else {
                    setIsRecommendationMode(true);
                    setCentres(recommendationsData.recommendations || []);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  isRecommendationMode
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {isRecommendationMode ? 'Viewing Best Matches' : 'Switch to Best Matches'}
              </button>
            </div>
          </div>
        )}

        {/* 2. LOCATION SEARCH & SELECTION BAR */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D0DDD0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#3E5C54]">Location & Proximity Discovery</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#3E5C54]" />
                <span>
                  Current Search: {selectedDistrict !== 'All' ? selectedDistrict : 'All Districts'}, {selectedState !== 'All' ? selectedState : 'All States'}
                </span>
              </div>
            </div>

            {/* Use My Current Location (Explicit GPS Consent) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRequestGPS}
                disabled={isLocating}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  hasLocationConsent
                    ? 'bg-[#E6ECE5] text-[#2F453F] border border-[#3E5C54]'
                    : 'bg-[#FAF9F5] text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-[#3E5C54]" />
                <span>{isLocating ? 'Capturing approximate area...' : hasLocationConsent ? 'Location Consent Active (~1.1km)' : 'Use My Current Location'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLocationModal(!showLocationModal)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                {showLocationModal ? 'Hide Location Selector' : 'Change Location'}
              </button>
            </div>
          </div>

          {locationNotice && (
            <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-700" />
              <span>{locationNotice}</span>
            </div>
          )}

          {/* Collapsible Location Selector */}
          {showLocationModal && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Union Territory</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setSelectedState(st);
                    setSelectedDistrict('All');
                    fetchCentres({ state: st, district: 'All' });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                >
                  <option value="All">All States</option>
                  {filterOptions?.states.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    const dt = e.target.value;
                    setSelectedDistrict(dt);
                    fetchCentres({ district: dt });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                >
                  <option value="All">All Districts</option>
                  {selectedState !== 'All' && filterOptions?.districtsByState[selectedState]?.map(dt => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                  {selectedState === 'All' && Object.values(filterOptions?.districtsByState || {}).flat().map((dt, idx) => (
                    <option key={dt + idx} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City or Locality Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Shivajinagar or Bandra"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 5. FILTER CONTROLS & MOBILE VIEW TOGGLE */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D0DDD0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            
            {/* Filter Tags: Service, Capacity, Distance */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </span>

              {/* Service Filter */}
              <select
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  fetchCentres({ service: e.target.value });
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-[#FAF9F5] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
              >
                <option value="all">All Services</option>
                <option value="shelter">Safe Shelter</option>
                <option value="medical">Medical Assistance</option>
                <option value="legal">Legal Assistance</option>
                <option value="counselling">Psychological Counselling</option>
                <option value="police">Police Assistance</option>
                <option value="other">Other Support</option>
              </select>

              {/* Shelter Availability */}
              <select
                value={shelterAvailability}
                onChange={(e) => {
                  setShelterAvailability(e.target.value);
                  fetchCentres({ shelterAvailability: e.target.value });
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-[#FAF9F5] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
              >
                <option value="all">Shelter: All</option>
                <option value="available">Shelter: Beds Available</option>
                <option value="limited">Shelter: Limited Beds (≤3)</option>
                <option value="not_available">Shelter: Full (0 Beds)</option>
                <option value="unverified">Shelter: Unverified Freshness</option>
              </select>

              {/* Sorting Options */}
              <select
                value={sortBy}
                onChange={(e) => {
                  const s = e.target.value as any;
                  setSortBy(s);
                  fetchCentres({ sortBy: s });
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-[#FAF9F5] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#3E5C54]"
              >
                <option value="best_match">Sort: Best Match</option>
                <option value="nearest">Sort: Nearest First</option>
                <option value="availability">Sort: Most Beds Available</option>
              </select>

              {/* Clear filters button */}
              {(selectedState !== 'All' || selectedDistrict !== 'All' || selectedService !== 'all' || shelterAvailability !== 'all' || selectedAccessibility.length > 0 || searchQuery) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 text-xs text-red-600 hover:text-red-800 hover:underline font-semibold"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Mobile View Toggle (List vs Map) */}
            <div className="flex sm:hidden w-full items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-500">View Layout:</span>
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-[#2F453F] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span>List ({centres.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'map'
                      ? 'bg-white text-[#2F453F] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>
            </div>

          </div>

          {/* Accessibility Multi-Select Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold mr-1">Accessibility Facilities:</span>
            {[
              { id: 'wheelchair', label: 'Wheelchair Ramp' },
              { id: 'infant_care', label: 'Infant / Child Care' },
              { id: 'hearing_sign', label: 'Sign Language' },
              { id: 'elderly_care', label: 'Elderly Support' },
              { id: 'medical_storage', label: 'Medication Fridge' },
              { id: 'ground_floor', label: 'Ground Floor' }
            ].map((acc) => {
              const isSelected = selectedAccessibility.includes(acc.id);
              return (
                <button
                  type="button"
                  key={acc.id}
                  onClick={() => {
                    handleToggleAccessibility(acc.id);
                    const updated = selectedAccessibility.includes(acc.id)
                      ? selectedAccessibility.filter(id => id !== acc.id)
                      : [...selectedAccessibility, acc.id];
                    fetchCentres({ accessibility: updated });
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#3E5C54] text-white border-[#3E5C54]'
                      : 'bg-[#FAF9F5] text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{acc.label}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 6. CONTENT AREA: SPLIT LIST & MAP VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: LISTING CARDS (Shown on mobile if viewMode === 'list' or on desktop always) */}
          <div className={`space-y-4 ${viewMode === 'map' ? 'hidden lg:block' : 'block'} lg:col-span-7`}>
            
            {/* Header / Count indicator */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-600">
                {isLoading ? 'Searching verified centres...' : `${centres.length} Verified One Stop Centres available`}
              </span>
              <span className="text-[11px] text-slate-400">
                Continuous 24/7 emergency intake
              </span>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-6 bg-white rounded-3xl border border-slate-200 animate-pulse space-y-3">
                    <div className="h-5 bg-slate-200 rounded-lg w-2/3"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-1/3"></div>
                    <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {errorMessage && !isLoading && (
              <div className="p-5 bg-red-50 text-red-900 border border-red-200 rounded-3xl text-xs space-y-2">
                <div className="font-bold flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Unable to load centre registry</span>
                </div>
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => fetchCentres()}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 text-xs"
                >
                  Retry Search
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !errorMessage && centres.length === 0 && (
              <div className="p-8 sm:p-12 bg-white rounded-3xl border border-[#D0DDD0] text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <Compass className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900">No Centres Match Selected Criteria</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Try broadening your state/district selection, adjusting shelter availability, or clearing accessibility filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* 4. OSC LISTING CARDS */}
            {!isLoading && centres.map((centre) => {
              const isSelected = selectedCentreId === centre._id;
              const hasRecommendation = Boolean(centre.recommendation);

              return (
                <div
                  key={centre._id}
                  ref={el => { cardRefs.current[centre._id] = el; }}
                  onClick={() => setSelectedCentreId(centre._id)}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer space-y-4 ${
                    isSelected
                      ? 'border-[#3E5C54] ring-2 ring-[#3E5C54]/20 shadow-md bg-[#FAF9F5]/40'
                      : 'border-[#D0DDD0] hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Top Row: Name, District, Distance, Recommendation Badge */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                          {centre.centreCode}
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Govt. Certified</span>
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {centre.name}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-slate-700">{centre.district}, {centre.state}</span>
                        {centre.distanceKm !== undefined ? (
                          <>
                            <span>·</span>
                            <span className="text-[#3E5C54] font-bold">{centre.distanceKm} km away</span>
                          </>
                        ) : (
                          <>
                            <span>·</span>
                            <span>Public Hospital Campus</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Match Score Badge (if recommendation available) */}
                    {hasRecommendation && (
                      <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-1">
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs shadow-2xs">
                          {centre.recommendation?.matchPercentage}% Match
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium hidden sm:inline">
                          Weighted Fit
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Why this centre is recommended (Micro-explanation) */}
                  {hasRecommendation && centre.recommendation?.explanation && (
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-[11px] leading-tight">
                        <strong>Why recommended:</strong> {centre.recommendation.explanation}
                      </span>
                    </div>
                  )}

                  {/* Shelter Availability & Capacity */}
                  <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-[#3E5C54]" />
                      <span className="font-semibold text-slate-700">Safe Shelter Capacity:</span>
                      
                      {/* Capacity Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                        centre.capacity.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : centre.capacity.status === 'Limited'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : centre.capacity.status === 'Unverified'
                          ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        {centre.capacity.status}: {centre.capacity.availableBeds} beds available
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium">
                      {centre.capacity.freshnessText}
                    </span>
                  </div>

                  {/* Services Offered Badges */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Services Active at Centre</div>
                    <div className="flex flex-wrap gap-1.5">
                      {centre.services.map(srv => {
                        const Icon = SERVICE_ICONS[srv.category] || Building2;
                        const isAvailable = srv.status === 'Available';
                        return (
                          <span
                            key={srv.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border ${
                              isAvailable
                                ? 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                                : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                            }`}
                          >
                            <Icon className="w-3 h-3 text-[#3E5C54]" />
                            <span>{srv.title}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Accessibility Support Tags */}
                  {centre.accessibilityFacilities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1 text-[11px] text-slate-600">
                      <Accessibility className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                      {centre.accessibilityFacilities.map(accId => (
                        <span key={accId} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                          {accId.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons: View Details & Select Centre */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href={`tel:${centre.contact.helpline.split('/')[0].trim()}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#3E5C54]" />
                        <span>Helpline: {centre.contact.helpline.split('/')[0].trim()}</span>
                      </a>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailedModalCentre(centre);
                        }}
                        className="px-3 py-2 rounded-xl border border-[#A3B899] text-[#2F453F] hover:bg-[#E6ECE5] text-xs font-semibold"
                      >
                        View Details
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCentre(centre, requestReference);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Select Centre</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: INTERACTIVE MAP VIEWER (Sticky on desktop, full tab on mobile) */}
          <div className={`lg:col-span-5 sticky top-24 ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-3xl p-5 border border-[#D0DDD0] shadow-sm space-y-3">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-[#3E5C54]" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Geospatial Centre Map
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMapZoom(prev => Math.min(prev + 0.3, 2.5))}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                    title="Zoom in"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapZoom(prev => Math.max(prev - 0.3, 0.8))}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-100"
                    title="Zoom out"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMapZoom(1); setMapPan({ x: 0, y: 0 }); }}
                    className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Map Canvas */}
              <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl bg-[#EAF0E8] overflow-hidden border border-[#D0DDD0] select-none">
                
                {/* SVG Geospatial Vector Canvas */}
                <svg
                  className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
                  style={{
                    transform: `scale(${mapZoom}) translate(${mapPan.x}px, ${mapPan.y}px)`,
                    transformOrigin: 'center center'
                  }}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Subtle Grid Lines & Regional Shading */}
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#D3E0D0" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />

                  {/* Approximate district clusters */}
                  <circle cx="50" cy="50" r="44" fill="#F4F8F3" stroke="#C5D6C2" strokeWidth="0.8" strokeDasharray="2,2" />

                  {/* User Pin (if coordinates shared with consent) */}
                  {userCoordinates && (() => {
                    const { x, y } = projectCoordinates(userCoordinates.lat, userCoordinates.lng);
                    return (
                      <g key="user-pos" className="transition-all">
                        <circle cx={x} cy={y} r="6" fill="#3B82F6" fillOpacity="0.2" className="animate-ping" />
                        <circle cx={x} cy={y} r="3" fill="#2563EB" stroke="#FFFFFF" strokeWidth="0.8" />
                        <text x={x} y={y - 4} fontSize="3" textAnchor="middle" fill="#1E40AF" fontWeight="bold">
                          Your Area (~1.1km)
                        </text>
                      </g>
                    );
                  })()}

                  {/* OSC Center Markers */}
                  {centres.map((c) => {
                    const { x, y } = projectCoordinates(c.coordinates.lat, c.coordinates.lng);
                    const isSelected = selectedCentreId === c._id;
                    const isAvailable = c.capacity.status === 'Available';
                    const isLimited = c.capacity.status === 'Limited';
                    const pinColor = isAvailable ? '#059669' : isLimited ? '#D97706' : '#64748B';

                    return (
                      <g
                        key={c._id}
                        onClick={() => handleSelectMarker(c._id)}
                        className="cursor-pointer group"
                      >
                        {isSelected && (
                          <circle cx={x} cy={y} r="5.5" fill={pinColor} fillOpacity="0.3" className="animate-pulse" />
                        )}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 3.5 : 2.5}
                          fill={pinColor}
                          stroke="#FFFFFF"
                          strokeWidth="0.8"
                        />
                        <text
                          x={x}
                          y={y + 4.5}
                          fontSize="2.5"
                          textAnchor="middle"
                          fill="#1E293B"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          className="pointer-events-none drop-shadow-xs"
                        >
                          {c.district}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Privacy Watermark */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[9px] text-slate-600 border border-slate-200">
                  Approximate hospital campus locations · Safehouse addresses protected
                </div>
              </div>

              {/* Selected Marker Floating Card */}
              {selectedCentre && (
                <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#3E5C54]">
                        Selected on Map
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                        {selectedCentre.name}
                      </h4>
                      <div className="text-[11px] text-slate-500">
                        {selectedCentre.district} · {selectedCentre.distanceKm !== undefined ? `${selectedCentre.distanceKm} km away` : 'District Hub'}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border shrink-0 ${
                      selectedCentre.capacity.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : selectedCentre.capacity.status === 'Limited'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}>
                      {selectedCentre.capacity.availableBeds} beds
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDetailedModalCentre(selectedCentre)}
                      className="text-xs text-[#3E5C54] hover:underline font-semibold"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectCentre(selectedCentre, requestReference)}
                      className="px-3 py-1.5 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <span>Select Centre</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </main>

      {/* 8. OSC DETAILS MODAL (When "View Details" clicked) */}
      {detailedModalCentre && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="osc-details-title"
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#D0DDD0] overflow-hidden my-6 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#F4F7F4] border-b border-[#D0DDD0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#3E5C54] text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="osc-details-title" className="text-base sm:text-lg font-bold text-slate-900">
                    {detailedModalCentre.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {detailedModalCentre.centreCode} · Ministry of Women & Child Development
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailedModalCentre(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Privacy Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Confidentiality Protection:</strong> Listed address is the public district administrative / hospital campus liaison point. Precise residential safehouse addresses are strictly withheld to protect survivor security.
                </p>
              </div>

              {/* General Location & Helpline */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] space-y-2">
                <div className="font-bold text-slate-900 text-sm">Centre Contact & Campus Location</div>
                <p className="text-slate-700">
                  <strong>General Campus:</strong> {detailedModalCentre.address}
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <div>
                    <span className="text-slate-500">24/7 Helpline: </span>
                    <strong className="text-[#3E5C54]">{detailedModalCentre.contact.helpline}</strong>
                  </div>
                  {detailedModalCentre.contact.landline && (
                    <div>
                      <span className="text-slate-500">Landline: </span>
                      <strong>{detailedModalCentre.contact.landline}</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Hours: </span>
                    <strong>{detailedModalCentre.operatingHours}</strong>
                  </div>
                </div>
              </div>

              {/* Capacity Breakdown */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#D0DDD0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Shelter Capacity Status</span>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${
                    detailedModalCentre.capacity.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : detailedModalCentre.capacity.status === 'Limited'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}>
                    {detailedModalCentre.capacity.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Total Beds</div>
                    <div className="text-base font-extrabold text-slate-800">{detailedModalCentre.capacity.totalBeds}</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Occupied</div>
                    <div className="text-base font-extrabold text-slate-800">{detailedModalCentre.capacity.occupiedBeds}</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="text-[10px] text-emerald-700 uppercase font-bold">Available Now</div>
                    <div className="text-base font-extrabold text-emerald-800">{detailedModalCentre.capacity.availableBeds}</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  Freshness: {detailedModalCentre.capacity.freshnessText} (Updated: {new Date(detailedModalCentre.capacity.updatedAt).toLocaleString()})
                </p>
              </div>

              {/* Services List with Notes */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm">Available Services at this Centre</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detailedModalCentre.services.map(srv => {
                    const Icon = SERVICE_ICONS[srv.category] || Building2;
                    return (
                      <div key={srv.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Icon className="w-3.5 h-3.5 text-[#3E5C54]" />
                          <span>{srv.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{srv.operatingHours}</div>
                        {srv.notes && <p className="text-[11px] text-slate-600 italic">"{srv.notes}"</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accessibility */}
              {detailedModalCentre.accessibilityFacilities.length > 0 && (
                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#D0DDD0] space-y-1">
                  <div className="font-bold text-slate-900">Accessibility & Physical Accommodations</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {detailedModalCentre.accessibilityFacilities.map(accId => (
                      <span key={accId} className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 capitalize font-medium">
                        {accId.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`tel:${detailedModalCentre.contact.helpline.split('/')[0].trim()}`}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#3E5C54]" />
                <span>Call Centre Helpline</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const centre = detailedModalCentre;
                  setDetailedModalCentre(null);
                  onSelectCentre(centre, requestReference);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#3E5C54] hover:bg-[#2F453F] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Select This Centre & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
