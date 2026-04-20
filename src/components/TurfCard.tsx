import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users } from 'lucide-react';
import { Turf } from '../store/useStore';

interface TurfCardProps {
  turf: Turf;
}

const TurfCard: React.FC<TurfCardProps> = ({ turf }) => {
  return (
    <Link to={`/turf/${turf.id}`} className="group">
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-300">
        <div className="relative">
          <img
            src={turf.images[0]}
            alt={turf.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              turf.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {turf.available ? 'Available' : 'Booked'}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
              {turf.name}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-gray-300 text-sm">{turf.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {turf.location}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-400">
              ${turf.price}<span className="text-sm text-gray-400">/hour</span>
            </span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
              {turf.sport}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TurfCard;