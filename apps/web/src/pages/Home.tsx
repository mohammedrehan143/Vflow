import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingMap } from '../components/maps/ListingMap';
import {
  Car,
  Zap,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Lock,
  Phone,
  User,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  BookmarkCheck,
  Compass,
  BatteryCharging,
  AlertCircle,
  HelpCircle,
  Coffee,
  Check,
  ArrowLeft,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import {
  IVehicle,
  CustomerVehicleType,
  ConnectorType,
} from '@vflow/shared';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithOtp, quickDemoLogin, logout } = useAuth();

  // Onboarding Stage for new/unauthenticated users:
  // 'slides' -> 4-slide walkthrough (image copy 2 style)
  // 'phone' -> "Hello There 👋" phone number input (image style)
  // 'otp' -> 3-digit OTP verification ("123")
  const [onboardingStage, setOnboardingStage] = useState<'slides' | 'phone' | 'otp'>('slides');
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [exploreAsGuest, setExploreAsGuest] = useState(false);

  // OTP input refs for auto-focusing
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Touch tracking for swipe gestures
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Logged-in / Marketplace State
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
  const [serviceFilter, setServiceFilter] = useState<'all' | 'charging' | 'parking'>('all');
  const [cityFilter, setCityFilter] = useState('Bangalore');

  // Fetch listings for logged-in or guest marketplace
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['marketplaceListings', cityFilter, serviceFilter],
    queryFn: () =>
      api.listings.search({
        city: cityFilter,
        serviceType: serviceFilter === 'all' ? undefined : serviceFilter,
      }),
    enabled: isAuthenticated || exploreAsGuest,
  });

  const fetchUserVehicles = async () => {
    try {
      const res = await api.vehicles.list();
      if (res.success && res.vehicles) {
        setVehicles(res.vehicles);
        const def = res.vehicles.find((v) => v.isDefault) || res.vehicles[0] || null;
        setSelectedVehicle(def);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserVehicles();
    }
  }, [isAuthenticated]);

  // Touch handlers for walkthrough slides
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && currentSlide < 3) {
      setCurrentSlide((prev) => prev + 1);
    } else if (distance < -50 && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Submit Phone Number -> Move to OTP Step
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpError(null);
    setOtpDigits(['', '', '']);
    setOnboardingStage('otp');
    setTimeout(() => {
      otpInputRefs[0].current?.focus();
    }, 100);
  };

  // Handle OTP digit entry
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto-advance focus to next input
    if (digit && index < 2) {
      otpInputRefs[index + 1].current?.focus();
    }

    // If 3 digits are entered, auto-verify
    if (digit && index === 2 && newDigits[0] && newDigits[1]) {
      const fullOtp = `${newDigits[0]}${newDigits[1]}${digit}`;
      verifyEnteredOtp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  // Verify OTP (hardcoded to '123')
  const verifyEnteredOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code !== '123') {
      setOtpError('Invalid OTP. Please enter 123');
      return;
    }

    setAuthLoading(true);
    setOtpError(null);
    try {
      await loginWithOtp(phoneNumber, '123');
      await fetchUserVehicles();
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed. Please retry.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Walkthrough Slides Content
  const walkthroughSlides = [
    {
      id: 0,
      titleLine1: 'Turning your space into a',
      titleLine2: 'charging spot',
      highlightColor: 'text-emerald-700',
      pill: '1/4',
      badge: '⚡ EV Fast Charging',
      renderIllustration: () => (
        <svg viewBox="0 0 400 280" className="w-full max-w-sm h-64 mx-auto" fill="none">
          {/* House background sketch */}
          <path d="M70 230 L70 120 L200 40 L330 120 L330 230 Z" stroke="#E2E8F0" strokeWidth="2.5" fill="#F8FAFC" />
          <path d="M190 40 L190 20 L230 20 L230 65" stroke="#CBD5E1" strokeWidth="2" fill="none" />
          <line x1="50" y1="230" x2="350" y2="230" stroke="#CBD5E1" strokeWidth="3" />
          {/* Windows and doors */}
          <rect x="95" y="140" width="45" height="50" rx="4" stroke="#CBD5E1" strokeWidth="2" fill="#FFFFFF" />
          <rect x="260" y="140" width="45" height="50" rx="4" stroke="#CBD5E1" strokeWidth="2" fill="#FFFFFF" />
          <line x1="95" y1="165" x2="140" y2="165" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="117" y1="140" x2="117" y2="190" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* EV Wallbox Charger on house wall */}
          <rect x="290" y="130" width="28" height="42" rx="6" fill="#10B981" stroke="#059669" strokeWidth="2" />
          <path d="M304 140 L298 152 L303 152 L301 162 L309 149 L304 149 Z" fill="#FFFFFF" />
          {/* Cable from wallbox to car */}
          <path d="M296 172 C 290 200, 260 210, 240 195" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* Electric Car */}
          <g transform="translate(60, 130)">
            {/* Car body */}
            <path
              d="M30 60 C 45 40, 75 30, 110 30 L 140 30 C 175 30, 195 45, 210 60 L 225 65 C 235 70, 235 85, 225 85 L 15 85 C 5 85, 5 70, 15 65 Z"
              fill="#1E40AF"
            />
            {/* Car roof & cabin */}
            <path d="M60 40 L 95 10 L 155 10 L 185 40 Z" fill="#60A5FA" opacity="0.9" />
            <line x1="125" y1="10" x2="125" y2="40" stroke="#1E40AF" strokeWidth="2" />
            {/* Headlight & taillight */}
            <path d="M220 66 Q 228 72 220 78 Z" fill="#FACC15" />
            <path d="M16 66 Q 10 72 16 78 Z" fill="#EF4444" />
            {/* Wheels */}
            <circle cx="65" cy="85" r="18" fill="#0F172A" />
            <circle cx="65" cy="85" r="8" fill="#E2E8F0" />
            <circle cx="175" cy="85" r="18" fill="#0F172A" />
            <circle cx="175" cy="85" r="8" fill="#E2E8F0" />
          </g>
        </svg>
      ),
    },
    {
      id: 1,
      titleLine1: 'Zero street circling, guaranteed',
      titleLine2: 'parking bay',
      highlightColor: 'text-neutral-900',
      pill: '2/4',
      badge: '🅿️ Guaranteed Parking',
      renderIllustration: () => (
        <svg viewBox="0 0 400 280" className="w-full max-w-sm h-64 mx-auto" fill="none">
          {/* Parking structure backdrop */}
          <rect x="60" y="50" width="280" height="180" rx="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2.5" />
          <line x1="60" y1="230" x2="340" y2="230" stroke="#0F172A" strokeWidth="4" />
          {/* Parking Bay Markings */}
          <line x1="100" y1="230" x2="100" y2="130" stroke="#FACC15" strokeWidth="4" strokeDasharray="8 6" />
          <line x1="300" y1="230" x2="300" y2="130" stroke="#FACC15" strokeWidth="4" strokeDasharray="8 6" />
          {/* Digital Access Barrier Pillar */}
          <rect x="75" y="110" width="22" height="120" rx="4" fill="#0F172A" />
          <circle cx="86" cy="130" r="5" fill="#10B981" className="animate-pulse" />
          <rect x="80" y="145" width="12" height="16" rx="2" fill="#334155" />
          {/* Boom barrier arm */}
          <path d="M86 125 L 210 90" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" strokeDasharray="16 12" />

          {/* Reserved Parking Sign Badge */}
          <rect x="170" y="65" width="60" height="40" rx="8" fill="#0F172A" stroke="#FACC15" strokeWidth="2" />
          <text x="200" y="92" textAnchor="middle" fill="#FACC15" fontSize="22" fontWeight="900" fontFamily="sans-serif">
            🅿️
          </text>

          {/* Parked Vehicle */}
          <g transform="translate(100, 140)">
            <path
              d="M25 55 C 38 35, 65 25, 100 25 L 125 25 C 160 25, 180 38, 195 55 L 205 60 C 215 65, 215 80, 205 80 L 15 80 C 5 80, 5 65, 15 60 Z"
              fill="#0F172A"
            />
            <path d="M50 35 L 80 10 L 140 10 L 170 35 Z" fill="#CBD5E1" opacity="0.8" />
            <circle cx="55" cy="80" r="16" fill="#1E293B" />
            <circle cx="55" cy="80" r="7" fill="#F8FAFC" />
            <circle cx="165" cy="80" r="16" fill="#1E293B" />
            <circle cx="165" cy="80" r="7" fill="#F8FAFC" />
          </g>
        </svg>
      ),
    },
    {
      id: 2,
      titleLine1: 'Curbside luxury drop-off with',
      titleLine2: 'priority valet',
      highlightColor: 'text-amber-600',
      pill: '3/4',
      badge: '✨ Curbside Valet Drop-off',
      renderIllustration: () => (
        <svg viewBox="0 0 400 280" className="w-full max-w-sm h-64 mx-auto" fill="none">
          {/* Airport / Luxury Mall Canopy */}
          <path d="M50 70 L 350 70 L 330 95 L 70 95 Z" fill="#0F172A" />
          <line x1="80" y1="95" x2="80" y2="230" stroke="#94A3B8" strokeWidth="5" />
          <line x1="320" y1="95" x2="320" y2="230" stroke="#94A3B8" strokeWidth="5" />
          <line x1="40" y1="230" x2="360" y2="230" stroke="#CBD5E1" strokeWidth="3" />

          {/* Valet Stand Podium */}
          <rect x="250" y="140" width="36" height="70" rx="6" fill="#FACC15" stroke="#EAB308" strokeWidth="2" />
          <rect x="245" y="132" width="46" height="12" rx="4" fill="#0F172A" />
          <text x="268" y="175" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="900" fontFamily="sans-serif">
            VALET
          </text>

          {/* Key handover icon badge */}
          <circle cx="268" cy="110" r="18" fill="#0F172A" />
          <path d="M263 110 L 273 110 M273 110 L 273 115 M270 110 L 270 114" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="261" cy="110" r="4" stroke="#FACC15" strokeWidth="2.5" />

          {/* Premium Luxury Vehicle */}
          <g transform="translate(60, 140)">
            <path
              d="M20 50 C 35 30, 60 20, 95 20 L 125 20 C 160 20, 180 32, 195 50 L 205 55 C 215 60, 215 75, 205 75 L 12 75 C 2 75, 2 60, 12 55 Z"
              fill="#334155"
            />
            <path d="M45 30 L 75 8 L 135 8 L 165 30 Z" fill="#94A3B8" opacity="0.6" />
            <circle cx="50" cy="75" r="16" fill="#0F172A" />
            <circle cx="50" cy="75" r="7" fill="#FACC15" />
            <circle cx="160" cy="75" r="16" fill="#0F172A" />
            <circle cx="160" cy="75" r="7" fill="#FACC15" />
          </g>
        </svg>
      ),
    },
    {
      id: 3,
      titleLine1: 'Relax while you charge at',
      titleLine2: 'nearby hangout spots',
      highlightColor: 'text-amber-800',
      pill: '4/4',
      badge: '☕ Charge & Chill',
      renderIllustration: () => (
        <svg viewBox="0 0 400 280" className="w-full max-w-sm h-64 mx-auto" fill="none">
          {/* Cafe terrace & table */}
          <circle cx="200" cy="230" r="130" fill="#FEF3C7" opacity="0.4" />
          {/* Coffee Table */}
          <ellipse cx="200" cy="180" rx="75" ry="25" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="3" />
          <rect x="195" y="180" width="10" height="50" rx="3" fill="#64748B" />
          <ellipse cx="200" cy="230" rx="40" ry="10" fill="#CBD5E1" />

          {/* Giant steaming artisan coffee cup */}
          <rect x="175" y="130" width="45" height="40" rx="8" fill="#FACC15" stroke="#0F172A" strokeWidth="2.5" />
          <path d="M220 140 C 235 140, 235 160, 220 160" stroke="#0F172A" strokeWidth="3" fill="none" />
          {/* Coffee steam curves */}
          <path d="M185 120 C 182 110, 188 102, 185 92" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M198 120 C 195 108, 202 100, 198 88" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M210 120 C 207 110, 213 102, 210 92" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Location Pin & 300m badge */}
          <g transform="translate(110, 80)">
            <circle cx="20" cy="20" r="18" fill="#0F172A" />
            <path d="M20 10 L 20 25 M15 15 L 25 15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
            <rect x="-10" y="42" width="60" height="20" rx="10" fill="#0F172A" />
            <text x="20" y="56" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">
              300m away
            </text>
          </g>
        </svg>
      ),
    },
  ];

  // =========================================================================
  // VIEW 1: UNREGISTERED / NEW USER ONBOARDING
  // Matches user requested images:
  // - Walkthrough slides with pill indicator (image copy 2)
  // - "Hello There 👋" phone number input (image)
  // - 3-digit OTP verification ("123")
  // =========================================================================
  if (!isAuthenticated && !exploreAsGuest) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between selection:bg-yellow-400 selection:text-black">
        {/* Top Header Bar */}
        <header className="px-6 pt-6 pb-2 flex items-center justify-between max-w-md mx-auto w-full">
          {onboardingStage !== 'slides' ? (
            <button
              onClick={() => {
                if (onboardingStage === 'otp') setOnboardingStage('phone');
                else setOnboardingStage('slides');
              }}
              className="p-2 -ml-2 text-neutral-800 hover:text-black rounded-full hover:bg-neutral-100 transition"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <div className="w-5" />
          )}

          <div className="flex items-center gap-1.5 font-black text-sm tracking-tight text-neutral-900">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-black inline-block"></span>
            <span>VFLOW</span>
          </div>

          <button
            onClick={() => setExploreAsGuest(true)}
            className="text-xs font-bold text-neutral-500 hover:text-black transition"
          >
            Skip
          </button>
        </header>

        {/* ================= STAGE 1: 4-SLIDE WALKTHROUGH (image copy 2) ================= */}
        {onboardingStage === 'slides' && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="flex-1 flex flex-col justify-between px-6 py-6 max-w-md mx-auto w-full animate-in fade-in duration-300"
          >
            {/* Top Text Header */}
            <div className="text-center pt-2 space-y-1">
              <p className="text-lg sm:text-xl font-bold text-neutral-700 tracking-tight">
                {walkthroughSlides[currentSlide].titleLine1}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-tight">
                <span className="bg-yellow-400 text-black px-2.5 py-0.5 rounded-xl inline-block shadow-xs">
                  {walkthroughSlides[currentSlide].titleLine2}
                </span>
              </h2>
            </div>

            {/* Center Vector Illustration */}
            <div className="my-auto py-4 flex items-center justify-center">
              {walkthroughSlides[currentSlide].renderIllustration()}
            </div>

            {/* Lower Controls: Count Pill & Full Width Action Button */}
            <div className="space-y-6 pb-6">
              {/* Pill Indicator (e.g. 1/4, 2/4, 3/4, 4/4) */}
              <div className="flex justify-center">
                <div className="px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-black shadow-xs">
                  {walkthroughSlides[currentSlide].pill}
                </div>
              </div>

              {/* Action Button: Next or Get Started */}
              {currentSlide < 3 ? (
                <button
                  onClick={() => setCurrentSlide((prev) => prev + 1)}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-base rounded-2xl shadow-md transition active:scale-95 border border-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              ) : (
                <button
                  onClick={() => setOnboardingStage('phone')}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-base rounded-2xl shadow-md transition active:scale-95 border border-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STAGE 2: PHONE NUMBER SCREEN (image) ================= */}
        {onboardingStage === 'phone' && (
          <div className="flex-1 flex flex-col justify-between px-6 py-6 max-w-md mx-auto w-full animate-in fade-in duration-300">
            <div className="space-y-8 pt-4">
              {/* Big Bold Greeting */}
              <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight text-left">
                Hello There 👋
              </h1>

              {/* Phone Input Field */}
              <form onSubmit={handlePhoneSubmit} id="phone-form" className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-2 text-left">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-3 border-b-2 border-neutral-300 focus-within:border-neutral-900 transition pb-2.5">
                    {/* Indian Flag SVG */}
                    <div className="w-8 h-5.5 rounded-xs overflow-hidden border border-neutral-200 shrink-0 shadow-xs flex flex-col">
                      <div className="h-1/3 bg-[#FF9933]" />
                      <div className="h-1/3 bg-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full border border-[#000080] flex items-center justify-center">
                          <div className="w-0.5 h-0.5 rounded-full bg-[#000080]" />
                        </div>
                      </div>
                      <div className="h-1/3 bg-[#128807]" />
                    </div>

                    {/* Country Code */}
                    <span className="text-lg font-bold text-neutral-900 select-none">+91</span>

                    {/* Phone Input */}
                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="w-full bg-transparent text-lg font-semibold tracking-wider text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                    />
                  </div>
                </div>

                {/* Legal Disclaimer */}
                <p className="text-xs text-neutral-600 leading-relaxed text-left font-medium">
                  By signing up, you accept VFlow's{' '}
                  <span className="font-bold text-neutral-900 underline underline-offset-2">Terms</span>,{' '}
                  <span className="font-bold text-neutral-900 underline underline-offset-2">Privacy and Policy</span>.
                </p>
              </form>
            </div>

            {/* Bottom Send OTP Action Button */}
            <div className="pb-6 space-y-3">
              <button
                type="submit"
                form="phone-form"
                disabled={phoneNumber.length < 10}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-base rounded-2xl shadow-md transition active:scale-95 border border-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Send OTP</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => quickDemoLogin('customer')}
                  className="text-xs font-black text-neutral-500 hover:text-black underline underline-offset-4"
                >
                  ⚡ Or Quick 1-Tap Driver Demo Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: OTP VERIFICATION (Hardcoded '123') ================= */}
        {onboardingStage === 'otp' && (
          <div className="flex-1 flex flex-col justify-between px-6 py-6 max-w-md mx-auto w-full animate-in fade-in duration-300">
            <div className="space-y-6 pt-4 text-left">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                  Verify Phone 🔐
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
                  We sent a 3-digit verification code to <span className="font-bold text-neutral-900">+91 {phoneNumber}</span>
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-400 text-black text-xs font-black">
                  <span>Testing Mode: Enter OTP</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-black text-yellow-400 font-mono">123</span>
                </div>
              </div>

              {otpError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* 3-Digit OTP Boxes */}
              <div className="flex items-center justify-center gap-4 py-4">
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="tel"
                    maxLength={1}
                    value={otpDigits[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-16 h-18 text-center text-3xl font-black rounded-2xl bg-neutral-50 border-2 border-neutral-300 focus:border-neutral-900 focus:bg-white text-neutral-900 outline-none transition shadow-xs"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOtpDigits(['', '', '']);
                    setOtpError(null);
                    otpInputRefs[0].current?.focus();
                  }}
                  className="font-bold text-neutral-600 hover:text-black flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingStage('phone')}
                  className="font-bold text-neutral-900 hover:underline"
                >
                  Change Number
                </button>
              </div>
            </div>

            {/* Bottom Verify Action Button */}
            <div className="pb-6 space-y-3">
              <button
                type="button"
                onClick={() => verifyEnteredOtp()}
                disabled={authLoading || otpDigits.some((d) => !d)}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-base rounded-2xl shadow-md transition active:scale-95 border border-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{authLoading ? 'Verifying...' : 'Verify OTP'}</span>
                <Check className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LOGGED-IN MARKETPLACE APP (OR GUEST BROWSE)
  // Clean Major White design with interactive MapLibre map and verified stations
  // =========================================================================
  const listings = listingsData?.listings || [];

  return (
    <div className="min-h-screen bg-white text-neutral-900 space-y-8 pb-24 selection:bg-yellow-400 selection:text-black">
      {/* Top Banner / User Welcome */}
      <section className="border-b border-neutral-200 bg-neutral-50/70 pt-6 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Verified EV & Parking Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
              {isAuthenticated ? `Welcome back, ${user?.fullName?.split(' ')[0] || 'Driver'}! 👋` : 'Explore VFlow Mobility'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
              {isAuthenticated
                ? selectedVehicle
                  ? `Active vehicle: ${selectedVehicle.manufacturer} ${selectedVehicle.model} (${selectedVehicle.maxDcPowerKw || 50} kW DC)`
                  : 'Fast chargers and guaranteed private parking bays ready for reservation'
                : 'Browse verified high-speed charging hubs and reserved parking bays'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                onClick={() => setExploreAsGuest(false)}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-xl shadow-xs transition"
              >
                Sign In / Verify OTP
              </button>
            ) : (
              <Link
                to="/vehicles"
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-black text-xs rounded-xl border border-neutral-300 transition flex items-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                <span>My Vehicles ({vehicles.length})</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Interactive Map & Search Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Service Type Filter Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServiceFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 ${
                serviceFilter === 'all'
                  ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
                  : 'bg-white text-neutral-700 hover:text-black border border-neutral-300'
              }`}
            >
              All Hubs ({listings.length})
            </button>
            <button
              onClick={() => setServiceFilter('charging')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 active:scale-95 ${
                serviceFilter === 'charging'
                  ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
                  : 'bg-white text-neutral-700 hover:text-black border border-neutral-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>EV Fast Charging</span>
            </button>
            <button
              onClick={() => setServiceFilter('parking')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 active:scale-95 ${
                serviceFilter === 'parking'
                  ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
                  : 'bg-white text-neutral-700 hover:text-black border border-neutral-300'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Parking Only</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
            <span>City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-neutral-100 text-neutral-900 font-black px-2.5 py-1.5 rounded-xl border border-neutral-300 cursor-pointer focus:outline-none"
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi-NCR">Delhi-NCR</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>
        </div>

        {/* Interactive MapLibre GL Map (Zepto-style) */}
        <div className="h-[460px] sm:h-[520px] rounded-3xl overflow-hidden border-2 border-neutral-200 shadow-md">
          <ListingMap listings={listings} />
        </div>

        {/* Verified Listings Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-neutral-900">
              Verified Spots in {cityFilter}
            </h3>
            <span className="text-xs text-neutral-500 font-semibold">{listings.length} available</span>
          </div>

          {listingsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 bg-neutral-100 rounded-3xl animate-pulse border border-neutral-200" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <ListingCard key={item._id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-2">
              <Car className="w-8 h-8 text-neutral-400 mx-auto" />
              <h4 className="font-black text-neutral-900">No stations match current filter</h4>
              <p className="text-xs text-neutral-500">Try switching filters or selecting another city.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
