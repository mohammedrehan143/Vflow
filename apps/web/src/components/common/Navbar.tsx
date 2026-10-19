import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePWA } from '../../context/PWAContext';
import {
  Zap,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  LayoutDashboard,
  Car,
  Clock,
  Compass,
  Download,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout, quickDemoLogin } = useAuth();
  const { openInstallFlow, isStandalone } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-neutral-800 text-white">
      {/* Top Demo Quick Switcher Banner */}
      <div className="bg-neutral-950 text-neutral-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          <span className="font-medium text-neutral-200">VFlow Live Marketplace</span>
          <span className="text-neutral-600 hidden sm:inline">|</span>
          <span className="text-neutral-400 hidden sm:inline">Role:</span>
          <span className="font-bold text-yellow-400 uppercase tracking-wider">
            {role ? role : 'Guest Driver'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 hidden md:inline text-[11px]">Quick Switch:</span>
          <button
            onClick={() => quickDemoLogin('customer')}
            className={`px-2 py-0.5 rounded text-xs transition font-bold ${
              role === 'customer'
                ? 'bg-yellow-400 text-black shadow-sm'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            Driver
          </button>
          <button
            onClick={() => quickDemoLogin('provider')}
            className={`px-2 py-0.5 rounded text-xs transition font-bold ${
              role === 'provider'
                ? 'bg-yellow-400 text-black shadow-sm'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            Host
          </button>
          <button
            onClick={() => quickDemoLogin('admin')}
            className={`px-2 py-0.5 rounded text-xs transition font-bold ${
              role === 'admin'
                ? 'bg-yellow-400 text-black shadow-sm'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-black shadow-lg shadow-yellow-400/20 group-hover:scale-105 transition">
            <Zap className="w-5 h-5 fill-black text-black" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight text-white group-hover:text-yellow-400 transition">
              VFlow
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
              Mobility
            </span>
          </div>
        </Link>

        {/* Primary Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 font-semibold text-sm">
          <Link
            to="/parking"
            className={`px-3 py-2 rounded-xl transition ${
              isActive('/parking')
                ? 'bg-neutral-900 text-yellow-400 border border-yellow-400/30'
                : 'text-neutral-300 hover:text-yellow-400 hover:bg-neutral-900/60'
            }`}
          >
            Find Parking
          </Link>
          <Link
            to="/charging"
            className={`px-3 py-2 rounded-xl transition ${
              isActive('/charging')
                ? 'bg-neutral-900 text-yellow-400 border border-yellow-400/30'
                : 'text-neutral-300 hover:text-yellow-400 hover:bg-neutral-900/60'
            }`}
          >
            Find EV Charging
          </Link>
          <Link
            to="/nearby"
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              isActive('/nearby')
                ? 'bg-neutral-900 text-yellow-400 border border-yellow-400/30'
                : 'text-neutral-300 hover:text-yellow-400 hover:bg-neutral-900/60'
            }`}
          >
            <Compass className="w-4 h-4 text-yellow-400" />
            Explore Hangouts
          </Link>
          <Link
            to="/valet"
            className="px-3 py-2 rounded-xl transition flex items-center gap-2 text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          >
            <span>Valet</span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-neutral-800 text-yellow-400 border border-neutral-700">
              Coming Soon
            </span>
          </Link>
        </nav>

        {/* Action Controls & User Menu */}
        <div className="hidden lg:flex items-center gap-3">
          {/* PWA Install Button */}
          {!isStandalone && (
            <button
              onClick={openInstallFlow}
              type="button"
              className="text-xs font-bold text-yellow-400 hover:text-black hover:bg-yellow-400 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-yellow-400/40 transition active:scale-95"
              title="Install VFlow Web App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Role-based dashboard button */}
          {role === 'provider' ? (
            <Link
              to="/provider/dashboard"
              className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black px-4 py-2 rounded-xl shadow-md transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Host Dashboard
            </Link>
          ) : role === 'admin' ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-yellow-400 text-xs font-black px-4 py-2 rounded-xl border border-yellow-400/40 shadow-sm transition"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          ) : (
            <Link
              to="/become-a-host"
              className="text-xs font-bold text-yellow-400 hover:text-white hover:bg-neutral-900 px-3 py-2 rounded-xl transition"
            >
              Become a Host
            </Link>
          )}

          {/* User profile / Log in */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <Link
                to="/vehicles"
                className="text-neutral-300 hover:text-yellow-400 p-2 rounded-xl hover:bg-neutral-900 transition"
                title="My Vehicles"
              >
                <Car className="w-4 h-4" />
              </Link>
              <Link
                to="/bookings"
                className="text-neutral-300 hover:text-yellow-400 p-2 rounded-xl hover:bg-neutral-900 transition"
                title="My Bookings"
              >
                <Clock className="w-4 h-4" />
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-xs font-bold text-white hover:text-yellow-400 py-1.5 px-2.5 rounded-xl hover:bg-neutral-900 transition"
              >
                <div className="w-7 h-7 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center text-xs">
                  {user.fullName.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-neutral-400 hover:text-red-400 rounded-xl hover:bg-neutral-900 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition active:scale-95"
            >
              <User className="w-4 h-4 text-black" />
              Sign In / Up
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          {!isStandalone && (
            <button
              onClick={openInstallFlow}
              type="button"
              className="p-2 text-yellow-400 hover:bg-neutral-900 rounded-xl transition"
              title="Install VFlow App"
              aria-label="Install VFlow App"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-white hover:bg-neutral-900 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-yellow-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-800 bg-neutral-950 px-4 pt-3 pb-6 space-y-3 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-neutral-800">
            <Link
              to="/parking"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-neutral-900 hover:bg-neutral-800 rounded-2xl flex flex-col gap-1 text-white border border-neutral-800"
            >
              <Car className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-sm">Find Parking</span>
              <span className="text-[11px] text-neutral-400">Reserved spaces</span>
            </Link>
            <Link
              to="/charging"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-neutral-900 hover:bg-neutral-800 rounded-2xl flex flex-col gap-1 text-white border border-neutral-800"
            >
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-sm">Find EV Charging</span>
              <span className="text-[11px] text-neutral-400">Type 2 & DC Fast</span>
            </Link>
          </div>

          <div className="space-y-1">
            <Link
              to="/nearby"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-900 text-sm font-semibold"
            >
              <Compass className="w-5 h-5 text-yellow-400" />
              Explore Nearby Hangouts
            </Link>
            <Link
              to="/vehicles"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-900 text-sm font-semibold"
            >
              <Car className="w-5 h-5 text-yellow-400" />
              My Vehicle & Watts Specs
            </Link>
            <Link
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-900 text-sm font-semibold"
            >
              <Clock className="w-5 h-5 text-yellow-400" />
              My Bookings & Sessions
            </Link>
            {role === 'provider' && (
              <Link
                to="/provider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-yellow-400 text-black text-sm font-black"
              >
                <LayoutDashboard className="w-5 h-5" />
                Host Dashboard & Payouts
              </Link>
            )}
            {role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-900 text-yellow-400 text-sm font-bold border border-yellow-400/40"
              >
                <Shield className="w-5 h-5" />
                Admin Console
              </Link>
            )}
            {!isStandalone && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openInstallFlow();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-900 border border-yellow-400/30 text-yellow-400 text-sm font-bold text-left transition hover:bg-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" />
                  <span>Install VFlow App</span>
                </div>
                <span className="text-[10px] font-black uppercase bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                  PWA
                </span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-neutral-800">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center text-xs">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{user.fullName}</div>
                    <div className="text-xs text-neutral-400">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-400 font-bold px-3 py-1.5 rounded-xl border border-red-900 hover:bg-red-950/40"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center block bg-yellow-400 hover:bg-yellow-300 text-black font-black py-2.5 rounded-xl shadow"
              >
                Sign In to VFlow
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
