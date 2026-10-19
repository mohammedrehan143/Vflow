import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, CreditCard, Sparkles, Smartphone, Mail, Phone } from 'lucide-react';
import { PLATFORM_CONFIG } from '@vflow/shared';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-neutral-400 border-t border-neutral-800 text-sm">
      {/* Trust & Guarantee Highlights Bar */}
      <div className="border-b border-neutral-800 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Next-Day Host Settlements</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Eligible net earnings for completed parking & charging sessions are settled next calendar day.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Razorpay Secure Checkout</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Bank-grade 256-bit encryption with instantaneous HMAC signature verification and webhooks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Destination Engine Included</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Discover nearby cafes, restaurants, and shopping spots while your vehicle is parked or charging.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-xl mb-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black">
              <Zap className="w-4 h-4 fill-black" />
            </div>
            <span className="text-white">VFlow</span>
          </Link>
          <p className="text-xs leading-relaxed text-neutral-400 max-w-sm">
            {PLATFORM_CONFIG.TAGLINE} An Airbnb-style marketplace connecting vehicle owners with verified parking spaces and EV charging infrastructure across India.
          </p>

          <div className="mt-4 flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <Phone className="w-3.5 h-3.5 text-yellow-400" />
              <span>{PLATFORM_CONFIG.SUPPORT_PHONE}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <Mail className="w-3.5 h-3.5 text-yellow-400" />
              <span>{PLATFORM_CONFIG.SUPPORT_EMAIL}</span>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-white font-bold text-xs tracking-wider uppercase mb-3">Drivers</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/parking" className="hover:text-yellow-400 transition">Find Parking</Link></li>
            <li><Link to="/charging" className="hover:text-yellow-400 transition">Find EV Charging</Link></li>
            <li><Link to="/nearby" className="hover:text-yellow-400 transition">Explore Hangouts</Link></li>
            <li><Link to="/bookings" className="hover:text-yellow-400 transition">My Bookings</Link></li>
            <li><Link to="/valet" className="hover:text-yellow-400 text-yellow-500/80 transition">Valet (Coming Soon)</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-bold text-xs tracking-wider uppercase mb-3">Hosts & Operators</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/become-a-host" className="hover:text-yellow-400 transition">Become a Host</Link></li>
            <li><Link to="/provider/dashboard" className="hover:text-yellow-400 transition">Host Dashboard</Link></li>
            <li><Link to="/provider/payouts" className="hover:text-yellow-400 transition">Next-Day Payouts</Link></li>
            <li><Link to="/provider/listings/new" className="hover:text-yellow-400 transition">List Your Space</Link></li>
            <li><Link to="/admin" className="hover:text-yellow-400 transition">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-bold text-xs tracking-wider uppercase mb-3">Company & Legal</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className="hover:text-yellow-400 transition">About VFlow</Link></li>
            <li><Link to="/help" className="hover:text-yellow-400 transition">Help & FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-400 transition">Contact Us</Link></li>
            <li><Link to="/terms" className="hover:text-yellow-400 transition">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-yellow-400 transition">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="hover:text-yellow-400 transition">Cancellation & Refunds</Link></li>
            <li>
              <Link to="/install-pwa" className="inline-flex items-center gap-1 text-yellow-400 font-semibold hover:underline">
                <Smartphone className="w-3.5 h-3.5" />
                Install Web App (PWA)
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500 max-w-7xl mx-auto px-4">
        <p>© 2026 VFlow Technologies Private Limited. All rights reserved. Pure High-Performance Mobility Platform.</p>
      </div>
    </footer>
  );
};
