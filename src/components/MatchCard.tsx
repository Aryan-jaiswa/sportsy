import React from 'react';
import { Calendar, Clock, MapPin, Users, Trophy } from 'lucide-react';
import { Match } from '../store/useStore';

interface MatchCardProps {
  match: Match;
  onJoin?: (matchId: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onJoin }) => {
  const spotsLeft = match.playersNeeded - match.currentPlayers;
  
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-600';
      case 'Intermediate': return 'bg-yellow-600';
      case 'Pro': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 border border-gray-700 hover:border-blue-500/50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">{match.sport} Match</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getSkillLevelColor(match.skillLevel)}`}>
            {match.skillLevel}
          </span>
        </div>
        <div className="text-right">
          <div className="flex items-center text-gray-400 text-sm mb-1">
            <Users className="w-4 h-4 mr-1" />
            <span>{match.currentPlayers}/{match.playersNeeded}</span>
          </div>
          <span className="text-blue-400 font-medium">
            {spotsLeft} spots left
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-300 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date(match.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        
        <div className="flex items-center text-gray-300 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          <span>{match.time}</span>
        </div>
        
        <div className="flex items-center text-gray-300 text-sm">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{match.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <span className="text-gray-400 text-sm">
          Created by <span className="text-white font-medium">{match.createdBy}</span>
        </span>
        
        {onJoin && spotsLeft > 0 && (
          <button
            onClick={() => onJoin(match.id)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Join Match
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchCard;