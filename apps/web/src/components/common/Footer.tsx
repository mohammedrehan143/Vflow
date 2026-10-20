import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Smartphone, Mail, Phone } from 'lucide-react';
import { PLATFORM_CONFIG } from '@vflow/shared';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-50 text-neutral-600 border-t border-neutral-200 text-sm">
      {/* Main Links Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 text-neutral-900 font-black text-xl mb-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black shadow-xs">
              <Zap className="w-4 h-4 fill-black stroke-black" />
            </div>
            <span className="text-neutral-900">VFlow</span>
          </Link>
          <p className="text-xs leading-relaxed text-neutral-600 max-w-sm">
            {PLATFORM_CONFIG.TAGLINE} An Airbnb-style marketplace connecting vehicle owners with verified parking spaces and EV charging infrastructure across India.
          </p>

          <div className="mt-4 flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2 text-neutral-700 font-semibold">
              <div className="w-5 h-5 rounded-full bg-yellow-400 text-black flex items-center justify-center">
                <Phone className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span>{PLATFORM_CONFIG.SUPPORT_PHONE}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700 font-semibold">
              <div className="w-5 h-5 rounded-full bg-black text-yellow-400 flex items-center justify-center">
                <Mail className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span>{PLATFORM_CONFIG.SUPPORT_EMAIL}</span>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-neutral-900 font-black text-xs tracking-wider uppercase mb-3">Drivers</h5>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link to="/parking" className="hover:text-black hover:underline transition">Find Parking</Link></li>
            <li><Link to="/charging" className="hover:text-black hover:underline transition">Find EV Charging</Link></li>
            <li><Link to="/nearby" className="hover:text-black hover:underline transition">Explore Hangouts</Link></li>
            <li><Link to="/bookings" className="hover:text-black hover:underline transition">My Bookings</Link></li>
            <li><Link to="/valet" className="text-amber-600 hover:text-black transition">Valet (Coming Soon)</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-neutral-900 font-black text-xs tracking-wider uppercase mb-3">Hosts & Operators</h5>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link to="/become-a-host" className="hover:text-black hover:underline transition">Become a Host</Link></li>
            <li><Link to="/provider/dashboard" className="hover:text-black hover:underline transition">Host Dashboard</Link></li>
            <li><Link to="/provider/payouts" className="hover:text-black hover:underline transition">Next-Day Payouts</Link></li>
            <li><Link to="/provider/listings/new" className="hover:text-black hover:underline transition">List Your Space</Link></li>
            <li><Link to="/admin" className="hover:text-black hover:underline transition">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-neutral-900 font-black text-xs tracking-wider uppercase mb-3">Company & Legal</h5>
          <ul className="space-y-2 text-xs font-semibold">
            <li><Link to="/about" className="hover:text-black hover:underline transition">About VFlow</Link></li>
            <li><Link to="/help" className="hover:text-black hover:underline transition">Help & FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-black hover:underline transition">Contact Us</Link></li>
            <li><Link to="/terms" className="hover:text-black hover:underline transition">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-black hover:underline transition">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-black hover:underline transition">Cancellation & Refunds</Link></li>
            <li>
              <Link to="/install-pwa" className="inline-flex items-center gap-1.5 text-black font-extrabold bg-yellow-400 px-2.5 py-1 rounded-lg mt-1 hover:bg-yellow-300">
                <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
                Install Web App (PWA)
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500 max-w-7xl mx-auto px-4">
        <p>© 2026 VFlow Technologies Private Limited. All rights reserved. Pure High-Performance Mobility Platform.</p>
      </div>
    </footer>
  );
};
