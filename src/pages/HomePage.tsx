import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, TrendingUp, Users, Trophy, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';
import TurfCard from '../components/TurfCard';
import MatchCard from '../components/MatchCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

const HomePage: React.FC = () => {
  const { 
    featuredTurfs, 
    upcomingMatches, 
    setFeaturedTurfs, 
    setUpcomingMatches, 
    loading, 
    setLoading,
    user 
  } = useStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollReveal(scrollContainerRef);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [turfs, matches] = await Promise.all([
          apiService.getFeaturedTurfs(),
          apiService.getUpcomingMatches()
        ]);
        setFeaturedTurfs(turfs);
        setUpcomingMatches(matches);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setFeaturedTurfs, setUpcomingMatches, setLoading]);

  const handleJoinMatch = async (matchId: string) => {
    if (!user) return;
    try {
      await apiService.joinMatch(matchId, user.id);
      // Refresh matches
      const matches = await apiService.getUpcomingMatches();
      setUpcomingMatches(matches);
    } catch (error) {
      console.error('Failed to join match:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your sports hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" ref={scrollContainerRef}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20" data-page-enter>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Find Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {' '}Game
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect with players, book premium turfs, and elevate your game with Sportsy.
            The ultimate platform for sports enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Play className="w-5 h-5 mr-2" />
              Find a Game
            </Link>
            <Link
              to="/create-match"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-semibold rounded-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Match
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-800/50" data-scroll-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">10K+</h3>
              <p className="text-gray-400">Active Players</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">500+</h3>
              <p className="text-gray-400">Premium Turfs</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">25K+</h3>
              <p className="text-gray-400">Matches Played</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Featured Turfs */}
        <section data-scroll-reveal>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Featured Turfs</h2>
            <Link
              to="/search"
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center transition-colors duration-200"
            >
              View All
              <TrendingUp className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTurfs.map((turf) => (
              <TurfCard key={turf.id} turf={turf} />
            ))}
          </div>
        </section>

        {/* Upcoming Matches */}
        <section data-scroll-reveal>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Upcoming Matches</h2>
            <Link
              to="/create-match"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Match
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onJoin={handleJoinMatch}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;