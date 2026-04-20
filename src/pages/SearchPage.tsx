import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';
import TurfCard from '../components/TurfCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sport: '',
    priceRange: [0, 100],
    rating: 0,
    date: '',
    time: '',
  });

  const { turfs, setTurfs, loading, setLoading } = useStore();
  const searchQuery = searchParams.get('q') || '';

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollReveal(scrollContainerRef);

  useEffect(() => {
    const loadTurfs = async () => {
      setLoading(true);
      try {
        const allTurfs = await apiService.getAllTurfs();
        setTurfs(allTurfs);
      } catch (error) {
        console.error('Failed to load turfs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTurfs();
  }, [setTurfs, setLoading]);

  const filteredTurfs = turfs.filter(turf => {
    const matchesQuery = searchQuery === '' || 
      turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turf.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turf.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = filters.sport === '' || turf.sport === filters.sport;
    const matchesPrice = turf.price >= filters.priceRange[0] && turf.price <= filters.priceRange[1];
    const matchesRating = turf.rating >= filters.rating;
    
    return matchesQuery && matchesSport && matchesPrice && matchesRating;
  });

  const sports = ['Basketball', 'Football', 'Tennis', 'Cricket', 'Badminton'];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8" data-page-enter>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Turfs'}
            </h1>
            <p className="text-gray-400">
              {filteredTurfs.length} turfs found
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors duration-200 mt-4 md:mt-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8" ref={scrollContainerRef}>
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>
              
              {/* Sport Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Sport
                </label>
                <select
                  value={filters.sport}
                  onChange={(e) => setFilters({...filters, sport: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Sports</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Price Range ($/hour)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: [parseInt(e.target.value), filters.priceRange[1]]
                    })}
                    className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                    })}
                    className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({ sport: '', priceRange: [0, 100], rating: 0, date: '', time: '' })}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-800 rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : filteredTurfs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTurfs.map((turf) => (
                  <TurfCard key={turf.id} turf={turf} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No turfs found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search criteria</p>
                <button
                  onClick={() => setFilters({ sport: '', priceRange: [0, 100], rating: 0, date: '', time: '' })}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;