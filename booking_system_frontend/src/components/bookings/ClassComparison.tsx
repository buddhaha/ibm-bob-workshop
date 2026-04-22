import { Plane, Crown, Rocket, Check, X } from 'lucide-react';
import type { Flight, SeatClass } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ClassComparisonProps {
  flight: Flight;
  selectedClass: SeatClass;
  onSelectClass: (seatClass: SeatClass) => void;
}

interface SeatClassInfo {
  name: string;
  class: SeatClass;
  price: number;
  seats: number;
  icon: typeof Plane;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  amenities: {
    name: string;
    included: boolean;
  }[];
}

export const ClassComparison = ({ flight, selectedClass, onSelectClass }: ClassComparisonProps) => {
  const seatClasses: SeatClassInfo[] = [
    {
      name: 'Economy',
      class: 'economy' as SeatClass,
      price: flight.economy_price,
      seats: flight.economy_seats_available,
      icon: Plane,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500',
      features: ['Standard seating', 'In-flight entertainment', 'Complimentary snacks'],
      amenities: [
        { name: 'Standard Seating', included: true },
        { name: 'In-flight Entertainment', included: true },
        { name: 'Complimentary Snacks', included: true },
        { name: 'Priority Boarding', included: false },
        { name: 'Extra Legroom', included: false },
        { name: 'Gourmet Meals', included: false },
        { name: 'VIP Lounge Access', included: false },
        { name: 'Personal Concierge', included: false },
        { name: 'Zero-G Experience', included: false },
      ],
    },
    {
      name: 'Business',
      class: 'business' as SeatClass,
      price: flight.business_price,
      seats: flight.business_seats_available,
      icon: Crown,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500',
      features: ['Premium seating', 'Priority boarding', 'Gourmet meals', 'Extra legroom'],
      amenities: [
        { name: 'Standard Seating', included: true },
        { name: 'In-flight Entertainment', included: true },
        { name: 'Complimentary Snacks', included: true },
        { name: 'Priority Boarding', included: true },
        { name: 'Extra Legroom', included: true },
        { name: 'Gourmet Meals', included: true },
        { name: 'VIP Lounge Access', included: false },
        { name: 'Personal Concierge', included: false },
        { name: 'Zero-G Experience', included: false },
      ],
    },
    {
      name: 'Galaxium Class',
      class: 'galaxium' as SeatClass,
      price: flight.galaxium_price,
      seats: flight.galaxium_seats_available,
      icon: Rocket,
      color: 'text-alien-green',
      bgColor: 'bg-alien-green/10',
      borderColor: 'border-alien-green',
      features: ['Luxury pods', 'VIP lounge access', 'Personal concierge', 'Zero-G experience'],
      amenities: [
        { name: 'Standard Seating', included: true },
        { name: 'In-flight Entertainment', included: true },
        { name: 'Complimentary Snacks', included: true },
        { name: 'Priority Boarding', included: true },
        { name: 'Extra Legroom', included: true },
        { name: 'Gourmet Meals', included: true },
        { name: 'VIP Lounge Access', included: true },
        { name: 'Personal Concierge', included: true },
        { name: 'Zero-G Experience', included: true },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-star-white mb-2">Compare Seat Classes</h3>
        <p className="text-sm text-star-white/60">
          Choose the perfect class for your interstellar journey
        </p>
      </div>

      {/* Mobile: Stacked cards */}
      <div className="block md:hidden space-y-3">
        {seatClasses.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedClass === sc.class;
          const isSoldOut = sc.seats === 0;

          return (
            <button
              key={sc.class}
              onClick={() => !isSoldOut && onSelectClass(sc.class)}
              disabled={isSoldOut}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? `${sc.borderColor} ${sc.bgColor}`
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={20} className={sc.color} />
                  <span className="font-semibold text-star-white">{sc.name}</span>
                  {isSelected && <Check size={18} className={sc.color} />}
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${sc.color}`}>
                    {formatCurrency(sc.price)}
                  </div>
                  <div className="text-xs text-star-white/60">
                    {isSoldOut ? 'Sold Out' : `${sc.seats} left`}
                  </div>
                </div>
              </div>
              <ul className="text-xs text-star-white/70 space-y-1">
                {sc.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <Check size={12} className={sc.color} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Desktop: Side-by-side comparison table */}
      <div className="hidden md:block overflow-x-auto">
        <div className="grid grid-cols-4 gap-3 min-w-[700px]">
          {/* Header row with class names and prices */}
          <div className="col-span-1">
            <div className="h-32 flex items-end pb-4">
              <span className="text-sm font-semibold text-star-white/70">Features</span>
            </div>
          </div>
          {seatClasses.map((sc) => {
            const Icon = sc.icon;
            const isSelected = selectedClass === sc.class;
            const isSoldOut = sc.seats === 0;

            return (
              <div key={sc.class} className="col-span-1">
                <button
                  onClick={() => !isSoldOut && onSelectClass(sc.class)}
                  disabled={isSoldOut}
                  className={`w-full h-32 p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `${sc.borderColor} ${sc.bgColor}`
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center text-center h-full justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={20} className={sc.color} />
                      {isSelected && <Check size={16} className={sc.color} />}
                    </div>
                    <div>
                      <div className="font-semibold text-star-white text-sm mb-1">
                        {sc.name}
                      </div>
                      <div className={`text-xl font-bold ${sc.color}`}>
                        {formatCurrency(sc.price)}
                      </div>
                      <div className="text-xs text-star-white/60 mt-1">
                        {isSoldOut ? 'Sold Out' : `${sc.seats} seats left`}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}

          {/* Amenities comparison rows */}
          {seatClasses[0].amenities.map((amenity, idx) => (
            <div key={idx} className="col-span-4 grid grid-cols-4 gap-3 border-t border-white/5 py-3">
              <div className="col-span-1 flex items-center">
                <span className="text-sm text-star-white/80">{amenity.name}</span>
              </div>
              {seatClasses.map((sc) => {
                const included = sc.amenities[idx].included;
                return (
                  <div key={sc.class} className="col-span-1 flex items-center justify-center">
                    {included ? (
                      <Check size={18} className={sc.color} />
                    ) : (
                      <X size={18} className="text-star-white/20" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Value proposition row */}
          <div className="col-span-4 grid grid-cols-4 gap-3 mt-4">
            <div className="col-span-1"></div>
            {seatClasses.map((sc) => {
              const isSoldOut = sc.seats === 0;
              const isSelected = selectedClass === sc.class;
              
              return (
                <div key={sc.class} className="col-span-1">
                  <button
                    onClick={() => !isSoldOut && onSelectClass(sc.class)}
                    disabled={isSoldOut}
                    className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                      isSelected
                        ? `${sc.bgColor} ${sc.color} border-2 ${sc.borderColor}`
                        : 'bg-white/5 text-star-white/70 border-2 border-white/10 hover:border-white/20'
                    } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {isSoldOut ? 'Sold Out' : isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-star-white/50 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1">
          <Check size={14} className="text-alien-green" />
          <span>Included</span>
        </div>
        <div className="flex items-center gap-1">
          <X size={14} className="text-star-white/20" />
          <span>Not included</span>
        </div>
      </div>
    </div>
  );
};

// Made with Bob