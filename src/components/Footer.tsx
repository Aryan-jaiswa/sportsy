import React from 'react';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent text-gray-200 py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Features</li>
              <li>Pricing</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Help Center</li>
              <li>Guides</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex items-center space-x-4 text-gray-300">
              <button aria-label="twitter" className="hover:text-white"><Twitter className="w-5 h-5" /></button>
              <button aria-label="facebook" className="hover:text-white"><Facebook className="w-5 h-5" /></button>
              <button aria-label="instagram" className="hover:text-white"><Instagram className="w-5 h-5" /></button>
              <button aria-label="linkedin" className="hover:text-white"><Linkedin className="w-5 h-5" /></button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Subscribe</h4>
            <p className="text-gray-400 text-sm mb-3">Get the latest updates and offers.</p>
            <div className="flex items-center space-x-2">
              <input aria-label="email" type="email" placeholder="Enter email" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Sportsy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
