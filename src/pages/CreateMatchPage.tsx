import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy,
  Clock,
  Plus
} from 'lucide-react';
import { apiService } from '../services/api';
import { useStore } from '../store/useStore';

interface MatchForm {
  sport: string;
  date: string;
  time: string;
  location: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Pro' | '';
  playersNeeded: number;
  description: string;
}

const CreateMatchPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<MatchForm>({
    sport: '',
    date: '',
    time: '',
    location: '',
    skillLevel: '',
    playersNeeded: 10,
    description: '',
  });

  const sports = [
    { name: 'Basketball', icon: '🏀' },
    { name: 'Football', icon: '⚽' },
    { name: 'Tennis', icon: '🎾' },
    { name: 'Cricket', icon: '🏏' },
    { name: 'Badminton', icon: '🏸' },
    { name: 'Volleyball', icon: '🏐' },
  ];

  const skillLevels = [
    { level: 'Beginner', description: 'New to the sport or casual play' },
    { level: 'Intermediate', description: 'Regular player with good skills' },
    { level: 'Pro', description: 'Competitive and advanced level' },
  ] as const;

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const handleSubmit = async () => {
    if (!user || !formData.sport || !formData.skillLevel) return;

    try {
      await apiService.createMatch({
        sport: formData.sport,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        skillLevel: formData.skillLevel,
        playersNeeded: formData.playersNeeded,
        currentPlayers: 1,
        createdBy: user.name,
        participants: [user.id],
      });
      
      navigate('/');
    } catch (error) {
      console.error('Failed to create match:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.sport !== '';
      case 2: return formData.date !== '' && formData.time !== '' && formData.location !== '';
      case 3: return formData.skillLevel !== '';
      case 4: return formData.playersNeeded > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8" data-page-enter>
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white mr-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">Create New Match</h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200 ${
                  step <= currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-600 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700" data-page-enter>
          {/* Step 1: Sport Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-blue-400" />
                Choose Your Sport
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sports.map((sport) => (
                  <button
                    key={sport.name}
                    onClick={() => setFormData({...formData, sport: sport.name})}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      formData.sport === sport.name
                        ? 'border-blue-500 bg-blue-600/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-4xl mb-2">{sport.icon}</div>
                    <div className="text-white font-medium">{sport.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date, Time & Location */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-400" />
                Set Time & Location
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Time
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter turf or venue name"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skill Level */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-blue-400" />
                Choose Skill Level
              </h2>
              
              <div className="space-y-4">
                {skillLevels.map((skill) => (
                  <button
                    key={skill.level}
                    onClick={() => setFormData({...formData, skillLevel: skill.level})}
                    className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.skillLevel === skill.level
                        ? 'border-blue-500 bg-blue-600/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-lg font-semibold text-white mb-2">
                      {skill.level}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {skill.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Final Details */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-400" />
                Final Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Players Needed
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={formData.playersNeeded}
                    onChange={(e) => setFormData({...formData, playersNeeded: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Add any additional details about the match..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-3">Match Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sport:</span>
                      <span className="text-white">{formData.sport}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date & Time:</span>
                      <span className="text-white">{formData.date} at {formData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span className="text-white">{formData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Skill Level:</span>
                      <span className="text-white">{formData.skillLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Players Needed:</span>
                      <span className="text-white">{formData.playersNeeded}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-700 mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="flex items-center bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="flex items-center bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Match
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMatchPage;