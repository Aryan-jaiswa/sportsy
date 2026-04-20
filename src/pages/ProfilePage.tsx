import React, { useRef } from 'react';
import { 
  User, 
  Trophy, 
  Star, 
  Calendar, 
  Users, 
  MapPin,
  Award,
  TrendingUp,
  GamepadIcon
} from 'lucide-react';
import { useStore } from '../store/useStore';
import MatchCard from '../components/MatchCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

const ProfilePage: React.FC = () => {
  const { user, upcomingMatches } = useStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollReveal(scrollContainerRef);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in</h2>
          <p className="text-gray-400">You need to be logged in to view your profile</p>
        </div>
      </div>
    );
  }

  const badgeColors = ['bg-yellow-600', 'bg-blue-600', 'bg-purple-600', 'bg-green-600'];

  return (
    <div className="min-h-screen bg-gray-900" ref={scrollContainerRef}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8" data-page-enter>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-gray-400 mb-4">{user.email}</p>
              
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{user.gamesPlayed}</div>
                  <div className="text-gray-400 text-sm">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{user.points}</div>
                  <div className="text-gray-400 text-sm">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{user.badges.length}</div>
                  <div className="text-gray-400 text-sm">Badges</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Badges Section */}
          <div className="lg:col-span-1" data-scroll-reveal>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-400" />
                Badges
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {user.badges.map((badge, index) => (
                  <div
                    key={badge}
                    className={`${badgeColors[index % badgeColors.length]} rounded-lg p-3 text-center`}
                  >
                    <Star className="w-6 h-6 text-white mx-auto mb-1" />
                    <div className="text-white text-sm font-medium">{badge}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Stats
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-white font-medium">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Favorite Sport</span>
                  <span className="text-white font-medium">Cricket</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Matches This Month</span>
                  <span className="text-white font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Team Player Score</span>
                  <span className="text-green-400 font-medium">9.2/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matches Section */}
          <div className="lg:col-span-2" data-scroll-reveal>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <GamepadIcon className="w-6 h-6 mr-2 text-blue-400" />
                My Upcoming Matches
              </h2>
              
              {upcomingMatches.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMatches.slice(0, 3).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                  <GamepadIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No upcoming matches
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Join a match or create your own to get started!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                      Find Matches
                    </button>
                    <button className="bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                      Create Match
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;