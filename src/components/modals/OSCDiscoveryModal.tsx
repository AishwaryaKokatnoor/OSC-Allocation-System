import React, { useState } from 'react';
import { X, MapPin, Navigation, ShieldCheck, Phone, CheckCircle, Bed, AlertCircle, ArrowRight, Search, ExternalLink } from 'lucide-react';
import { MOCK_OSC_CENTRES } from '../../data/mockData';
import { ServiceType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectCentreForRequest?: (centreName: string) => void;
}

export const OSCDiscoveryModal: React.FC<Props> = ({ isOpen, onClose, onSelectCentreForRequest }) => {
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shelterOnly, setShelterOnly] = useState(false);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualLocationRequest = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please select your district manually below.');
      return;
    }
    
    setHasRequestedLocation(true);
    navigator.geolocation.getCurrentPosition(
      (_pos) => {
        // Successfully got coordinates with explicit user consent
        // For demonstration, default to nearest verified centre
        setSelectedState('Karnataka');
        setSelectedDistrict('Bengaluru Urban');
      },
      (err) => {
        setLocationError(`Location request was declined or unavailable (${err.message}). You can comfortably choose your state and district from the menu below.`);
      },
      { timeout: 8000 }
    );
  };

  const filteredCentres = MOCK_OSC_CENTRES.filter((centre) => {
    if (selectedState !== 'All' && centre.state !== selectedState) return false;
    if (selectedDistrict !== 'All' && centre.district !== selectedDistrict) return false;
    if (shelterOnly && centre.availableBeds <= 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = centre.name.toLowerCase().includes(q);
      const matchDist = centre.district.toLowerCase().includes(q);
      const matchState = centre.state.toLowerCase().includes(q);
      const matchAddress = centre.address.toLowerCase().includes(q);
      if (!matchName && !matchDist && !matchState && !matchAddress) return false;
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="osc-discovery-title"
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D0DDD0] overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 bg-[#F4F7F4] border-b border-[#D0DDD0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#3E5C54] text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 id="osc-discovery-title" className="text-lg sm:text-xl font-bold text-[#1F2937]">
                Find Nearby One Stop Centres (OSCs)
              </h2>
              <p className="text-xs text-[#52606D]">
                Verified 24/7 government safety, medical, and shelter facilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            aria-label="Close discovery modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Privacy & Location Consent Disclaimer */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <strong className="block font-semibold">Consent-Based Location Privacy:</strong>
              SakhiLink strictly never tracks your GPS coordinates automatically. You can choose your district manually below or voluntarily tap to find nearby centres.
            </div>
            <button
              onClick={handleManualLocationRequest}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300/80 text-amber-950 font-medium text-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Use Current Location</span>
            </button>
          </div>

          {locationError && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Search & Filters */}
          <div className="space-y-3 bg-[#FAF9F5] p-4 rounded-xl border border-[#D0DDD0]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by city, hospital name, district, or PIN code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E5C54] bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">State / UT</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('All');
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="All">All States & Territories</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Telangana">Telangana</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="All">All Districts</option>
                  {selectedState === 'Delhi' || selectedState === 'All' ? <option value="Central Delhi">Central Delhi</option> : null}
                  {selectedState === 'Karnataka' || selectedState === 'All' ? <option value="Bengaluru Urban">Bengaluru Urban</option> : null}
                  {selectedState === 'Maharashtra' || selectedState === 'All' ? <option value="Mumbai Suburban">Mumbai Suburban</option> : null}
                  {selectedState === 'Telangana' || selectedState === 'All' ? <option value="Hyderabad">Hyderabad</option> : null}
                  {selectedState === 'West Bengal' || selectedState === 'All' ? <option value="Kolkata">Kolkata</option> : null}
                  {selectedState === 'Tamil Nadu' || selectedState === 'All' ? <option value="Chennai">Chennai</option> : null}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white w-full cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={shelterOnly}
                    onChange={(e) => setShelterOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#3E5C54] focus:ring-[#3E5C54]"
                  />
                  <span className="font-medium text-slate-700">Only Available Beds</span>
                </label>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Showing <strong>{filteredCentres.length}</strong> verified centres</span>
              <span>All centres operate 24/7 with female caseworkers</span>
            </div>

            {filteredCentres.length === 0 ? (
              <div className="text-center py-8 bg-[#FAF9F5] rounded-xl border border-[#D0DDD0] text-sm text-slate-500">
                No centres matched your exact filter. Try clearing filters or call <strong>181</strong> directly for immediate regional guidance.
              </div>
            ) : (
              filteredCentres.map((centre) => (
                <div
                  key={centre.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#3E5C54] bg-white transition-all shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {centre.name}
                        </h3>
                        {centre.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Official Centre
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{centre.address}</span>
                      </p>
                    </div>

                    {/* Shelter Bed status badge */}
                    <div className="shrink-0 flex items-center gap-2 bg-[#F4F7F4] px-3 py-1.5 rounded-lg border border-[#D0DDD0]">
                      <Bed className="w-4 h-4 text-[#3E5C54]" />
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#2F453F]">
                          {centre.availableBeds} beds available
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {centre.occupiedBeds}/{centre.totalBeds} occupied
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Helplines and actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-4 text-slate-700">
                      <a
                        href={`tel:${centre.helpline.split('/')[0].trim()}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#3E5C54] hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{centre.helpline}</span>
                      </a>
                      <span className="text-slate-400 hidden sm:inline">·</span>
                      <span className="text-slate-500 hidden sm:inline">{centre.operatingHours}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onSelectCentreForRequest) {
                            onSelectCentreForRequest(centre.name);
                          }
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#3E5C54] hover:bg-[#2F453F] text-white font-medium text-xs transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <span>Request Support Here</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
