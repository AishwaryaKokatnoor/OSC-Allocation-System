import React from 'react';
import { Home, Stethoscope, Scale, HeartHandshake, ShieldAlert, HandHeart, ArrowRight, Check, LucideIcon } from 'lucide-react';
import { ServiceType } from '../types';
import { SERVICES_DATA } from '../data/mockData';

interface ServicesGridProps {
  onSelectService: (serviceId: ServiceType) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Home,
  Stethoscope,
  Scale,
  HeartHandshake,
  ShieldAlert,
  HandHeart
};

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6ECE5] text-[#2F453F] text-xs font-bold uppercase tracking-wider">
            Integrated Support Under One Roof
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            Comprehensive Services Provided by One Stop Centres
          </h2>
          <p className="text-sm sm:text-base text-[#52606D] leading-relaxed">
            Every service is free of cost, delivered by female case coordinators and specialized professionals, and accessible immediately without prior appointments.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service) => {
            const IconComponent = iconMap[service.iconName] || Home;

            return (
              <div
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-[#D0DDD0] hover:border-[#3E5C54] shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectService(service.id);
                  }
                }}
              >
                <div className="space-y-4">
                  
                  {/* Top Bar: Icon & Availability */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4F7F4] text-[#3E5C54] group-hover:bg-[#3E5C54] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-[#2F453F] bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#D0DDD0]">
                      {service.availability}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#3E5C54] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {service.shortDesc}
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <ul className="space-y-1.5 pt-1 border-t border-slate-100">
                    {service.typicalSupport.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-[#3E5C54] mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                </div>

                {/* Card Action */}
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectService(service.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F4F7F4] hover:bg-[#3E5C54] text-[#2F453F] hover:text-white font-bold text-xs sm:text-sm transition-all group-hover:shadow-xs"
                    aria-label={`Request ${service.title}`}
                  >
                    <span>Request {service.title}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
