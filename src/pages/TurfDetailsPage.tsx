import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  ArrowLeft,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiService } from '../services/api';
import { Turf } from '../store/useStore';

const TurfDetailsPage: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { loading, setLoading } = useStore();

  useEffect(() => {
    const loadTurf = async () => {
      if (!turfId) return;
      
      setLoading(true);
      try {
        const turfData = await apiService.getTurfById(turfId);
        setTurf(turfData);
      } catch (error) {
        console.error('Failed to load turf:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTurf();
  }, [turfId, setLoading]);

  const handleBooking = async () => {
    if (!turf || !selectedDate || !selectedTime) return;
    
    try {
      await apiService.createBooking({
        turfId: turf.id,
        date: selectedDate,
        time: selectedTime,
      });
      setShowBookingModal(false);
      // Show success message or redirect
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const amenityIcons: Record<string, React.ReactNode> = {
    'Air Conditioning': <Wind className="w-5 h-5" />,
    'Parking': <Car className="w-5 h-5" />,
    'Wifi': <Wifi className="w-5 h-5" />,
    'Refreshments': <Coffee className="w-5 h-5" />,
    'Changing Rooms': <Users className="w-5 h-5" />,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading turf details...</p>
        </div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Turf not found</h2>
          <Link
            to="/search"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div data-page-enter>
        <Link
          to="/search"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-10">
              <img
                src={turf.images[selectedImage]}
                alt={turf.name}
                className="w-full h-80 object-cover rounded-xl"
              />
            </div>
            
            {turf.images.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto">
                {turf.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${turf.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Turf Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{turf.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{turf.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{turf.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">
                    ${turf.price}
                  </div>
                  <div className="text-gray-400 text-sm">per hour</div>
                </div>
              </div>
              
              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {turf.sport}
              </span>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {turf.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-300">
                    {amenityIcons[amenity] || <Clock className="w-5 h-5" />}
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Book This Turf</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Time</option>
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                      <option key={hour} value={`${hour}:00`}>
                        {hour}:00 - {hour + 1}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center transition-colors duration-200"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Book Now - ${turf.price}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Confirm Booking</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Turf:</span>
                <span className="text-white font-medium">{turf.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span className="text-white font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time:</span>
                <span className="text-white font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-blue-400 font-bold text-lg">${turf.price}</span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing Wind import from lucide-react
import { Wind } from 'lucide-react';

export default TurfDetailsPage;