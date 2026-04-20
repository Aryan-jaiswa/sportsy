import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import TurfDetailsPage from './pages/TurfDetailsPage';
import CreateMatchPage from './pages/CreateMatchPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import { useAnimationStore } from './store/useAnimationStore';

function App() {
  const isTransitioning = useAnimationStore((s) => s.isTransitioning);

  return (
    <Router>
      {/* Progress bar — sits above everything */}
      <div id="progress-bar" />

      <div
        className="min-h-screen bg-gray-900"
        data-transitioning={isTransitioning ? 'true' : 'false'}
      >
        <Navbar />
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/turf/:turfId" element={<TurfDetailsPage />} />
            <Route path="/create-match" element={<CreateMatchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </PageTransition>
        <Footer />
      </div>
    </Router>
  );
}

export default App;