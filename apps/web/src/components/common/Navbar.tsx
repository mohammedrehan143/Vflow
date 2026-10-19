import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout, quickDemoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Demo Quick Switcher Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">VFlow Marketplace Live Preview</span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Current Role:</span>
          <span className="font-semibold text-emerald-400 uppercase tracking-wide">
            {role ? role : 'Guest Driver'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline">Switch Demo Role:</span>
          <button
            onClick={() => quickDemoLogin('customer')}
            className={`px-2 py-0.5 rounded text-xs transition font-medium ${
              role === 'customer'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Driver (Aditya)
          </button>
          <button
            onClick={() => quickDemoLogin('provider')}
            className={`px-2 py-0.5 rounded text-xs transition font-medium ${
              role === 'provider'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Host (GreenPark)
          </button>
          <button
            onClick={() => quickDemoLogin('admin')}
            className={`px-2 py-0.5 rounded text-xs transition font-medium ${
              role === 'admin'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Admin (VFlow)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-600 transition">
              VFlow
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Mobility
            </span>
          </div>
        </Link>

        {/* Primary Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 font-medium text-sm text-slate-700">
          <Link
            to="/parking"
            className={`px-3 py-2 rounded-lg transition ${
              isActive('/parking')
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Find Parking
          </Link>
          <Link
            to="/charging"
            className={`px-3 py-2 rounded-lg transition ${
              isActive('/charging')
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Find EV Charging
          </Link>
          <Link
            to="/nearby"
            className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
              isActive('/nearby')
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            Explore Hangouts
          </Link>
          <Link
            to="/valet"
            className="px-3 py-2 rounded-lg transition flex items-center gap-2 text-slate-600 hover:bg-slate-100"
          >
            <span>Valet</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Coming Soon
            </span>
          </Link>
        </nav>

        {/* Action Controls & User Menu */}
        <div className="hidden lg:flex items-center gap-3">
          {/* PWA Install Link */}
          <Link
            to="/install-pwa"
            className="text-xs font-medium text-slate-600 hover:text-emerald-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Install App
          </Link>

          {/* Role-based dashboard button */}
          {role === 'provider' ? (
            <Link
              to="/provider/dashboard"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Host Dashboard
            </Link>
          ) : role === 'admin' ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          ) : (
            <Link
              to="/become-a-host"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-2 rounded-lg transition"
            >
              Become a Host
            </Link>
          )}

          {/* User profile / Log in */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/bookings"
                className="text-slate-600 hover:text-slate-900 text-sm font-medium p-2 rounded-lg hover:bg-slate-100"
                title="My Bookings"
              >
                <Clock className="w-4 h-4" />
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-700 py-1 px-2 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  {user.fullName.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/install-pwa"
            className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg"
            title="Install App"
          >
            <Download className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <Link
              to="/parking"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl flex flex-col gap-1 text-slate-800"
            >
              <Car className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-sm">Find Parking</span>
              <span className="text-xs text-slate-500">Reserved spaces</span>
            </Link>
            <Link
              to="/charging"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl flex flex-col gap-1 text-slate-800"
            >
              <Zap className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-sm">Find EV Charging</span>
              <span className="text-xs text-slate-500">Type 2 & DC Fast</span>
            </Link>
          </div>

          <div className="space-y-1">
            <Link
              to="/nearby"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
            >
              <Compass className="w-5 h-5 text-emerald-600" />
              Explore Nearby Hangouts
            </Link>
            <Link
              to="/valet"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-amber-600" />
                <span>Valet Services</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Coming Soon
              </span>
            </Link>
            <Link
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
            >
              <Clock className="w-5 h-5 text-slate-600" />
              My Bookings & Sessions
            </Link>
            {role === 'provider' && (
              <Link
                to="/provider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-semibold"
              >
                <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                Host Dashboard & Payouts
              </Link>
            )}
            {role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold"
              >
                <Shield className="w-5 h-5 text-emerald-400" />
                Admin Console
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{user.fullName}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 font-semibold px-3 py-1.5 rounded-lg border border-red-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center block bg-emerald-600 text-white font-semibold py-2.5 rounded-xl shadow"
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
