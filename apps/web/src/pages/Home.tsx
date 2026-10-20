import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ListingCard } from '../components/listings/ListingCard';
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
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  Coffee,
  Check,
} from 'lucide-react';
import {
  IVehicle,
  CustomerVehicleType,
  ConnectorType,
} from '@vflow/shared';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register, quickDemoLogin } = useAuth();

  // Mobile Carousel State (Phone layout: 4 slides)
  const [mobileSlide, setMobileSlide] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [valetWaitlistJoined, setValetWaitlistJoined] = useState(false);

  // Authentication form state (when not logged in)
  const [authTab, setAuthTab] = useState<'signup' | 'login'>('signup');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRemember, setAuthRemember] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Logged-in car configuration form state
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);

  // Car form fields
  const [carType, setCarType] = useState<CustomerVehicleType>('electric_car');
  const [carModel, setCarModel] = useState('Tata Nexon EV');
  const [customModel, setCustomModel] = useState('');
  const [maxAcKw, setMaxAcKw] = useState<string>('7.2');
  const [maxDcKw, setMaxDcKw] = useState<string>('50');
  const [selectedConnectors, setSelectedConnectors] = useState<ConnectorType[]>(['CCS2', 'Type 2']);
  const [licensePlate, setLicensePlate] = useState('');
  const [savingCar, setSavingCar] = useState(false);
  const [carSuccessMsg, setCarSuccessMsg] = useState<string | null>(null);

  // Nearby providers search state
  const [serviceFilter, setServiceFilter] = useState<'all' | 'charging' | 'parking'>('all');
  const [cityFilter, setCityFilter] = useState('Bangalore');

  // Fetch all listings for nearby providers section
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['nearbyListings', cityFilter, serviceFilter],
    queryFn: () =>
      api.listings.search({
        city: cityFilter,
        serviceType: serviceFilter === 'all' ? undefined : serviceFilter,
      }),
  });

  // Fetch vehicles if logged in
  const fetchUserVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const res = await api.vehicles.list();
      if (res.success && res.vehicles) {
        setVehicles(res.vehicles);
        const def = res.vehicles.find((v) => v.isDefault) || res.vehicles[0] || null;
        setSelectedVehicle(def);
        if (!def && res.vehicles.length === 0) {
          setShowCarForm(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserVehicles();
    }
  }, [isAuthenticated]);

  // Mobile carousel auto-advance timer (pauses when interacting or on slide 3 auth form)
  useEffect(() => {
    if (isInteracting || mobileSlide === 3) return;
    const interval = setInterval(() => {
      setMobileSlide((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, [isInteracting, mobileSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsInteracting(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      setMobileSlide((prev) => (prev + 1) % 4);
    } else if (isRightSwipe) {
      setMobileSlide((prev) => (prev - 1 + 4) % 4);
    }
    setTouchStart(null);
    setTouchEnd(null);
    setTimeout(() => setIsInteracting(false), 3000);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authTab === 'signup') {
        const dummyEmail = `${authPhone.replace(/\D/g, '')}@vflow-demo.in`;
        await register({
          fullName: authName.trim(),
          phone: authPhone.trim(),
          email: dummyEmail,
          password: authPassword,
          role: 'customer',
        });
      } else {
        await login({
          identifier: authPhone.trim(),
          password: authPassword,
          remember: authRemember,
        });
      }
      await fetchUserVehicles();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCar(true);
    setCarSuccessMsg(null);

    const actualModel = carModel === 'Other' ? customModel.trim() : carModel;
    if (!actualModel) {
      alert('Please enter your vehicle model');
      setSavingCar(false);
      return;
    }

    try {
      const res = await api.vehicles.create({
        vehicleType: carType,
        powertrain: carType.includes('electric') ? 'electric' : carType.includes('hybrid') ? 'hybrid' : 'petrol',
        manufacturer: actualModel.split(' ')[0] || 'Generic',
        model: actualModel,
        registrationNumber: licensePlate.trim().toUpperCase() || undefined,
        supportedConnectorTypes: selectedConnectors,
        maxAcPowerKw: parseFloat(maxAcKw) || 7.2,
        maxDcPowerKw: parseFloat(maxDcKw) || 50,
        isDefault: true,
      });

      if (res.success && res.vehicle) {
        setCarSuccessMsg(`✓ Successfully configured ${actualModel}! Showing compatible stations below.`);
        setSelectedVehicle(res.vehicle);
        setShowCarForm(false);
        await fetchUserVehicles();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save vehicle details');
    } finally {
      setSavingCar(false);
    }
  };

  const toggleConnector = (connector: ConnectorType) => {
    setSelectedConnectors((prev) =>
      prev.includes(connector) ? prev.filter((c) => c !== connector) : [...prev, connector]
    );
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 space-y-12 sm:space-y-16 pb-24 selection:bg-yellow-400 selection:text-black">
      {/* =========================================================================
          MOBILE PHONE LAYOUT 4-SLIDE ONBOARDING CAROUSEL
          (Visible on mobile/phone screens: lg:hidden)
          Slide 1: EV Fast Charging
          Slide 2: Reserved Parking
          Slide 3: Valet Parking
          Slide 4: Nearby Hangout Spots + Login / Signup Option
          ========================================================================= */}
      <section className="block lg:hidden px-3 pt-3">
        <div className="bg-white border-2 border-neutral-900 rounded-3xl overflow-hidden shadow-xl">
          {/* Top Quick-Jump Indicator Tabs */}
          <div className="grid grid-cols-4 border-b border-neutral-200 bg-neutral-50 text-[10px] font-black uppercase text-center">
            <button
              onClick={() => {
                setMobileSlide(0);
                setIsInteracting(true);
              }}
              className={`py-2 px-1 transition border-b-2 flex flex-col items-center gap-0.5 ${
                mobileSlide === 0
                  ? 'border-yellow-400 bg-white text-black font-extrabold'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <span>⚡</span>
              <span className="truncate">Charging</span>
            </button>
            <button
              onClick={() => {
                setMobileSlide(1);
                setIsInteracting(true);
              }}
              className={`py-2 px-1 transition border-b-2 flex flex-col items-center gap-0.5 ${
                mobileSlide === 1
                  ? 'border-yellow-400 bg-white text-black font-extrabold'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <span>🅿️</span>
              <span className="truncate">Parking</span>
            </button>
            <button
              onClick={() => {
                setMobileSlide(2);
                setIsInteracting(true);
              }}
              className={`py-2 px-1 transition border-b-2 flex flex-col items-center gap-0.5 ${
                mobileSlide === 2
                  ? 'border-yellow-400 bg-white text-black font-extrabold'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <span>✨</span>
              <span className="truncate">Valet</span>
            </button>
            <button
              onClick={() => {
                setMobileSlide(3);
                setIsInteracting(true);
              }}
              className={`py-2 px-1 transition border-b-2 flex flex-col items-center gap-0.5 ${
                mobileSlide === 3
                  ? 'border-yellow-400 bg-white text-black font-extrabold'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <span>☕</span>
              <span className="truncate">{isAuthenticated ? 'Account' : 'Sign In'}</span>
            </button>
          </div>

          {/* Swipeable Carousel Container */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative min-h-[460px] overflow-hidden"
          >
            {/* ---------------- SLIDE 1: EV FAST CHARGING ---------------- */}
            {mobileSlide === 0 && (
              <div className="p-4 flex flex-col justify-between h-full space-y-4 animate-in fade-in duration-300">
                <div className="relative rounded-2xl overflow-hidden h-48 bg-neutral-900 border border-neutral-200 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1000&auto=format&fit=crop&q=80"
                    alt="EV Fast Charging Hub"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider inline-block w-fit mb-1 shadow-xs">
                      ⚡ Slide 1 of 4: Fast Charging
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight">
                      High-Speed EV Fast Charging
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    Reserve certified fast chargers from 3.3 kW AC wallboxes to 150 kW DC rapid hubs. Live gun status, compatible connector filters, and zero idle penalty surprises.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                      <span className="font-black text-xs text-neutral-900 block">150 kW</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">DC Fast</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                      <span className="font-black text-xs text-neutral-900 block">CCS2 / T2</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">Plugs</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                      <span className="font-black text-xs text-neutral-900 block">100%</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">Live Status</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to="/find-charging"
                    className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl text-center shadow-xs transition active:scale-95 border border-yellow-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Find Fast Chargers</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                  <button
                    onClick={() => setMobileSlide(1)}
                    className="py-3 px-3.5 bg-black text-yellow-400 text-xs font-black rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- SLIDE 2: RESERVED PARKING ---------------- */}
            {mobileSlide === 1 && (
              <div className="p-4 flex flex-col justify-between h-full space-y-4 animate-in fade-in duration-300">
                <div className="relative rounded-2xl overflow-hidden h-48 bg-neutral-900 border border-neutral-200 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1000&auto=format&fit=crop&q=80"
                    alt="Reserved Parking Bays"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider inline-block w-fit mb-1 shadow-xs">
                      🅿️ Slide 2 of 4: Reserved Parking
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight">
                      Zero-Circling Parking Bays
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    Stop circling crowded city streets. Pre-book private parking spaces in apartment stilts, corporate tech parks, and malls with instant digital barrier PIN entry.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                      <span className="font-black text-xs text-neutral-900 block">Covered</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">Safe Bays</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                      <span className="font-black text-xs text-neutral-900 block">4-Digit PIN</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">Barrier Pass</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                      <span className="font-black text-xs text-neutral-900 block">Hourly</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">Flex Booking</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to="/find-parking"
                    className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl text-center shadow-xs transition active:scale-95 border border-yellow-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Find Parking Spaces</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                  <button
                    onClick={() => setMobileSlide(2)}
                    className="py-3 px-3.5 bg-black text-yellow-400 text-xs font-black rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- SLIDE 3: VALET PARKING ---------------- */}
            {mobileSlide === 2 && (
              <div className="p-4 flex flex-col justify-between h-full space-y-4 animate-in fade-in duration-300">
                <div className="relative rounded-2xl overflow-hidden h-48 bg-neutral-900 border border-neutral-200 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80"
                    alt="Valet Parking Experience"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3.5 text-white">
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider inline-block w-fit mb-1 shadow-xs">
                      ✨ Slide 3 of 4: Priority Valet
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight">
                      Curbside Valet Drop-Off
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    Skip searching entirely. Drop off your vehicle directly at airport terminals, premium shopping malls, and corporate towers with insured and background-checked valet professionals.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                      <span className="font-black text-xs text-neutral-900 block">Curbside</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">Terminal Drop</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                      <span className="font-black text-xs text-neutral-900 block">100% Insured</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">Vetted Staff</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                      <span className="font-black text-xs text-neutral-900 block">Live Status</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase">App Retrieval</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setValetWaitlistJoined(true)}
                    className="flex-1 py-3 px-4 bg-black hover:bg-neutral-800 text-yellow-400 text-xs font-black rounded-xl text-center shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>{valetWaitlistJoined ? '✓ Added to Priority Waitlist!' : 'Join Valet Waitlist'}</span>
                  </button>
                  <button
                    onClick={() => setMobileSlide(3)}
                    className="py-3 px-3.5 bg-yellow-400 text-black text-xs font-black rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1"
                  >
                    <span>Next: Auth</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- SLIDE 4: NEARBY HANGOUT SPOTS + DIRECT LOGIN / SIGNUP ---------------- */}
            {mobileSlide === 3 && (
              <div className="p-4 space-y-4 animate-in fade-in duration-300">
                {/* Hangout Header Preview */}
                <div className="relative rounded-2xl overflow-hidden h-36 bg-neutral-900 border border-neutral-200 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80"
                    alt="Nearby Hangout Spots & Cafes"
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider inline-block w-fit mb-1 shadow-xs">
                      ☕ Slide 4 of 4: Hangouts & Onboarding
                    </span>
                    <h3 className="text-lg font-black text-white leading-tight">
                      Nearby Hangouts + Fast Onboarding
                    </h3>
                  </div>
                </div>

                {/* Direct Login / Signup Form or User Card right on Slide 4 */}
                {!isAuthenticated ? (
                  <div className="bg-white rounded-2xl p-4 border border-neutral-300 shadow-sm space-y-3.5">
                    {/* Tab Switcher */}
                    <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('signup');
                          setAuthError(null);
                        }}
                        className={`py-1.5 text-xs font-black rounded-lg transition ${
                          authTab === 'signup'
                            ? 'bg-yellow-400 text-black shadow-xs'
                            : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        Quick Sign Up
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('login');
                          setAuthError(null);
                        }}
                        className={`py-1.5 text-xs font-black rounded-lg transition ${
                          authTab === 'login'
                            ? 'bg-yellow-400 text-black shadow-xs'
                            : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        Sign In
                      </button>
                    </div>

                    {authError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-2.5">
                      {authTab === 'signup' && (
                        <div>
                          <input
                            type="text"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Full Name (e.g. Aditya Sharma)"
                            className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black font-semibold"
                          />
                        </div>
                      )}

                      <div>
                        <input
                          type="text"
                          required
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder={authTab === 'signup' ? '10-Digit Mobile Number' : 'Mobile Number or Email'}
                          className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black font-semibold"
                        />
                      </div>

                      <div>
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Password (minimum 6 characters)"
                          className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black font-semibold"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xs border border-yellow-500/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{authLoading ? 'Verifying...' : authTab === 'signup' ? 'Create Account' : 'Sign In Now'}</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </form>

                    {/* Quick Demo Login Pill */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500 font-bold">1-Click Demo:</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => quickDemoLogin('customer')}
                          className="px-2.5 py-1 bg-black text-yellow-400 rounded-lg font-black text-[10px] active:scale-95"
                        >
                          ⚡ Driver Demo
                        </button>
                        <button
                          type="button"
                          onClick={() => quickDemoLogin('provider')}
                          className="px-2.5 py-1 bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-lg font-black text-[10px] active:scale-95"
                        >
                          Host Demo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Logged-in State Card on Slide 4 */
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-black">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-neutral-900">
                            Logged in as {user?.fullName.split(' ')[0]}
                          </h4>
                          <span className="text-[10px] text-neutral-500">
                            {selectedVehicle ? `${selectedVehicle.model} configured` : 'Ready to reserve'}
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="text-[10px] font-black uppercase text-neutral-700 bg-white border border-neutral-300 px-2 py-1 rounded-md"
                      >
                        Profile
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        to="/find-charging"
                        className="py-2.5 px-3 bg-yellow-400 text-black text-center text-xs font-black rounded-xl shadow-xs"
                      >
                        ⚡ Book Charger
                      </Link>
                      <Link
                        to="/find-parking"
                        className="py-2.5 px-3 bg-black text-yellow-400 text-center text-xs font-black rounded-xl shadow-xs"
                      >
                        🅿️ Book Parking
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Carousel Footer Controls: 4 Indicator Dots & Prev/Next */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-100 border-t border-neutral-200">
            <button
              onClick={() => setMobileSlide((prev) => (prev - 1 + 4) % 4)}
              className="p-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 transition active:scale-95"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* 4 Dots indicator */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMobileSlide(idx);
                    setIsInteracting(true);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    mobileSlide === idx
                      ? 'w-6 h-2 bg-yellow-400 border border-neutral-900'
                      : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setMobileSlide((prev) => (prev + 1) % 4)}
              className="p-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 transition active:scale-95"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Skip to Marketplace quick pill */}
        <div className="text-center pt-2">
          <a
            href="#nearby-providers-section"
            className="text-[11px] font-black text-neutral-500 hover:text-black underline underline-offset-4"
          >
            Skip preview & browse stations directly ↓
          </a>
        </div>
      </section>

      {/* =========================================================================
          HERO & ONBOARDING SECTION (DESKTOP / TABLET: hidden on mobile)
          ========================================================================= */}
      <section className="hidden lg:block relative overflow-hidden pt-10 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 bg-neutral-50/60">
        {/* Yellow ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-32 left-1/3 w-96 h-96 bg-yellow-300 rounded-full blur-[140px]"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-[140px]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Brand Message & Pitch */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-100 border border-yellow-400/60 text-neutral-900 text-xs font-black uppercase tracking-wider shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-black animate-ping"></span>
              India's Premier Parking & High-Speed EV Charging Network
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-neutral-900">
              Find Parking.{' '}
              <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-lg inline-block my-1 shadow-xs">
                Fast EV Charging.
              </span>{' '}
              <span className="text-neutral-500 text-3xl sm:text-5xl block mt-1 font-extrabold">Explore Nearby.</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed font-medium">
              Reserve guaranteed private parking bays and fast EV chargers in seconds. High-voltage charging from 3.3 kW to 150 kW DC, verified host bays, and instantaneous barrier PIN entry.
            </p>

            {/* Platform Trust Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-white border-2 border-neutral-200 rounded-2xl shadow-xs">
                <div className="text-neutral-900 font-black text-2xl flex items-center gap-1">
                  <span>100%</span>
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                </div>
                <div className="text-[11px] text-neutral-500 font-black uppercase tracking-wide">Guaranteed Bays</div>
              </div>
              <div className="p-3.5 bg-white border-2 border-neutral-200 rounded-2xl shadow-xs">
                <div className="text-neutral-900 font-black text-2xl flex items-center gap-1">
                  <span>150 kW</span>
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                </div>
                <div className="text-[11px] text-neutral-500 font-black uppercase tracking-wide">DC Fast Charging</div>
              </div>
              <div className="p-3.5 bg-white border-2 border-neutral-200 rounded-2xl shadow-xs">
                <div className="text-neutral-900 font-black text-2xl flex items-center gap-1">
                  <span>Next-Day</span>
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                </div>
                <div className="text-[11px] text-neutral-500 font-black uppercase tracking-wide">Host Settlements</div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form (Sign Up / Sign In OR Car Onboarding Prompt) */}
          <div className="lg:col-span-5">
            {!isAuthenticated ? (
              /* ================= GUEST SIGN UP / SIGN IN WIDGET ================= */
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-neutral-200 shadow-xl space-y-5 text-neutral-900">
                {/* Tab Switcher */}
                <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signup');
                      setAuthError(null);
                    }}
                    className={`py-2 text-xs font-black rounded-xl transition ${
                      authTab === 'signup'
                        ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    Quick Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError(null);
                    }}
                    className={`py-2 text-xs font-black rounded-xl transition ${
                      authTab === 'login'
                        ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-black text-neutral-900">
                    {authTab === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {authTab === 'signup'
                      ? 'Sign up with your mobile number to unlock instant reservations.'
                      : 'Sign in to access your saved vehicles and reserved spots.'}
                  </p>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authTab === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Aditya Sharma"
                          className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl pl-10 pr-3.5 py-2.5 border border-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                      {authTab === 'signup' ? 'Mobile Number' : 'Mobile Number or Email'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder={authTab === 'signup' ? '10-digit mobile (e.g. 9876543210)' : 'Mobile number or email'}
                        className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl pl-10 pr-3.5 py-2.5 border border-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl pl-10 pr-3.5 py-2.5 border border-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                      <input
                        type="checkbox"
                        checked={authRemember}
                        onChange={(e) => setAuthRemember(e.target.checked)}
                        className="w-4 h-4 accent-black rounded cursor-pointer"
                      />
                      <span className="text-[11px] font-bold">Always remember this session</span>
                    </label>

                    {authTab === 'login' && (
                      <Link to="/auth" className="text-[11px] font-black text-neutral-900 hover:underline">
                        Forgot Password?
                      </Link>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xs border border-yellow-500/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{authLoading ? 'Verifying...' : authTab === 'signup' ? 'Create Account & Start' : 'Sign In Now'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>

                {/* Quick 1-Click Demo Login */}
                <div className="pt-3 border-t border-neutral-200 text-center space-y-2">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold block">Or Quick 1-Click Demo</span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('customer')}
                      className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white hover:text-yellow-400 text-[11px] font-black transition active:scale-95"
                    >
                      Driver Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('provider')}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-yellow-400 text-[11px] font-black border border-neutral-700 transition active:scale-95"
                    >
                      Host Demo
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= LOGGED-IN VEHICLE & WATTS CARD ================= */
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-neutral-200 shadow-xl space-y-5 text-neutral-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-yellow-400 text-black font-black flex items-center justify-center shadow-xs">
                      <Zap className="w-5 h-5 fill-black stroke-black" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-neutral-900">
                        Welcome, {user?.fullName.split(' ')[0]}!
                      </h3>
                      <p className="text-xs text-neutral-500 font-semibold">Driver Account Active</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-black text-yellow-400">
                    Logged In
                  </span>
                </div>

                {/* Active Vehicle Status */}
                {selectedVehicle && !showCarForm ? (
                  <div className="p-4 rounded-2xl bg-neutral-50 border-2 border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-neutral-900 stroke-[2.5]" />
                        <div>
                          <span className="font-black text-sm text-neutral-900 block">
                            {selectedVehicle.manufacturer} {selectedVehicle.model}
                          </span>
                          <span className="text-[11px] text-neutral-500 capitalize font-medium">
                            {selectedVehicle.vehicleType.replace(/_/g, ' ')}
                            {selectedVehicle.registrationNumber ? ` · ${selectedVehicle.registrationNumber}` : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-400 text-black border border-yellow-500/20">
                        Default
                      </span>
                    </div>

                    {/* Watts and Ports Specs Pill */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-neutral-200 shadow-xs">
                        <span className="text-[10px] text-neutral-500 uppercase block font-black">Max AC Power</span>
                        <span className="font-black text-neutral-900 text-sm">{selectedVehicle.maxAcPowerKw || 7.2} kW</span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-neutral-200 shadow-xs">
                        <span className="text-[10px] text-neutral-500 uppercase block font-black">Max DC Fast</span>
                        <span className="font-black text-amber-600 text-sm">{selectedVehicle.maxDcPowerKw || 50} kW</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-600 font-medium">
                      <span className="text-neutral-900 font-black uppercase mr-1">Plugs:</span>
                      {selectedVehicle.supportedConnectorTypes?.join(', ') || 'CCS2, Type 2'}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowCarForm(true)}
                        className="text-xs font-black text-black hover:underline flex items-center gap-1 transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Update Car & Watts</span>
                      </button>
                      <Link
                        to="/vehicles"
                        className="text-xs font-bold text-neutral-600 hover:text-black flex items-center gap-1 transition"
                      >
                        <span>Manage Vehicles ({vehicles.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* ================= CAR & WATTS ONBOARDING FORM ================= */
                  <form onSubmit={handleSaveCar} className="space-y-4">
                    <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-2xl">
                      <span className="font-black text-xs text-neutral-900 uppercase tracking-wide block">
                        Vehicle & Charging Specification
                      </span>
                      <p className="text-[11px] text-neutral-700 mt-0.5 leading-relaxed font-medium">
                        Specify your car type and charging wattage (kW) so VFlow can automatically match 100% compatible chargers and parking bays.
                      </p>
                    </div>

                    {carSuccessMsg && (
                      <div className="p-2.5 bg-yellow-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
                        <span>{carSuccessMsg}</span>
                      </div>
                    )}

                    {/* Car Type Selector */}
                    <div>
                      <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1.5">
                        1. Type of Car / Vehicle
                      </label>
                      <select
                        value={carType}
                        onChange={(e) => setCarType(e.target.value as CustomerVehicleType)}
                        className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl px-3 py-2.5 border border-neutral-300 focus:outline-none focus:border-black font-semibold"
                      >
                        <option value="electric_car">Electric Car (EV)</option>
                        <option value="hybrid_car">Hybrid Car (PHEV / HEV)</option>
                        <option value="petrol_car">Petrol Car</option>
                        <option value="diesel_car">Diesel Car</option>
                        <option value="electric_two_wheeler">Electric Two-Wheeler (Scooter/Bike)</option>
                        <option value="petrol_two_wheeler">Petrol Two-Wheeler</option>
                        <option value="electric_three_wheeler">Electric Three-Wheeler (Auto/Rickshaw)</option>
                        <option value="other">Other Mobility Vehicle</option>
                      </select>
                    </div>

                    {/* Make & Model */}
                    <div>
                      <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1.5">
                        2. Model & Make
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {['Tata Nexon EV', 'MG ZS EV', 'Mahindra XUV400', 'Hyundai Ioniq 5', 'Ather 450X', 'Other'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setCarModel(preset);
                              if (preset.includes('Nexon')) {
                                setMaxAcKw('7.2');
                                setMaxDcKw('50');
                              } else if (preset.includes('ZS')) {
                                setMaxAcKw('7.4');
                                setMaxDcKw('50');
                              } else if (preset.includes('Ioniq')) {
                                setMaxAcKw('11');
                                setMaxDcKw('150');
                              } else if (preset.includes('Ather')) {
                                setCarType('electric_two_wheeler');
                                setMaxAcKw('3.3');
                                setMaxDcKw('0');
                              }
                            }}
                            className={`p-1.5 rounded-lg text-[11px] font-black transition border ${
                              carModel === preset
                                ? 'bg-yellow-400 text-black border-yellow-500 shadow-xs'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      {carModel === 'Other' && (
                        <input
                          type="text"
                          required
                          value={customModel}
                          onChange={(e) => setCustomModel(e.target.value)}
                          placeholder="Enter your vehicle make & model"
                          className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black mt-1 font-semibold"
                        />
                      )}
                    </div>

                    {/* Watts / Power Limits */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                          Max AC Watts (kW)
                        </label>
                        <select
                          value={maxAcKw}
                          onChange={(e) => setMaxAcKw(e.target.value)}
                          className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black font-semibold"
                        >
                          <option value="3.3">3.3 kW (Slow AC)</option>
                          <option value="7.2">7.2 kW (Home Wallbox)</option>
                          <option value="11">11 kW (Three Phase)</option>
                          <option value="22">22 kW (Commercial AC)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                          Max DC Watts (kW)
                        </label>
                        <select
                          value={maxDcKw}
                          onChange={(e) => setMaxDcKw(e.target.value)}
                          className="w-full bg-neutral-50 text-neutral-900 text-xs rounded-xl px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black font-semibold"
                        >
                          <option value="0">None / AC Only</option>
                          <option value="25">25 kW DC</option>
                          <option value="30">30 kW DC</option>
                          <option value="50">50 kW DC Fast</option>
                          <option value="60">60 kW DC Fast</option>
                          <option value="100">100 kW Ultra Fast</option>
                          <option value="150">150 kW Super Fast</option>
                        </select>
                      </div>
                    </div>

                    {/* Supported Connectors */}
                    <div>
                      <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1.5">
                        Connector Inlets
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['CCS2', 'Type 2', 'CHAdeMO', 'Bharat DC-001', '15A_3Pin'] as ConnectorType[]).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleConnector(c)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition border ${
                              selectedConnectors.includes(c)
                                ? 'bg-black text-yellow-400 border-black shadow-xs'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={savingCar}
                        className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xs border border-yellow-500/20 transition active:scale-95 disabled:opacity-50"
                      >
                        {savingCar ? 'Saving...' : 'Save & Show Compatible Providers'}
                      </button>
                      {selectedVehicle && (
                        <button
                          type="button"
                          onClick={() => setShowCarForm(false)}
                          className="px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs rounded-xl border border-neutral-300"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          APPLICATION DETAILS & ARCHITECTURAL HIGHLIGHTS SECTION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-block text-[11px] font-black uppercase tracking-widest text-neutral-900 px-3 py-1 rounded-full bg-yellow-400 border border-yellow-500/30 shadow-xs">
            About VFlow Mobility
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Comprehensive Urban Parking & EV Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
            Everything you need to know about the platform: from secure barrier digital PIN entries to high-voltage EV chargers and automated next-day host earnings.
          </p>
        </div>

        {/* 5 Architecture Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border-2 border-neutral-200 hover:border-black hover:shadow-lg rounded-3xl transition space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black flex items-center justify-center shadow-xs">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-neutral-900">Dual Booking Marketplace</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Book parking slots by the hour or day, high-power EV charging wallboxes, or bundled spaces with dedicated charger ports. Guaranteed reserved bays with no street hunting.
            </p>
          </div>

          <div className="p-6 bg-white border-2 border-neutral-200 hover:border-black hover:shadow-lg rounded-3xl transition space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-black text-yellow-400 flex items-center justify-center shadow-xs">
              <BatteryCharging className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-neutral-900">Power & Watts Compatibility Engine</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              VFlow verifies your car's AC and DC charging limits against the station's rated power. Overbooking prevention models each physical connector as an independent resource.
            </p>
          </div>

          <div className="p-6 bg-white border-2 border-neutral-200 hover:border-black hover:shadow-lg rounded-3xl transition space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black flex items-center justify-center shadow-xs">
              <CreditCard className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-neutral-900">Guaranteed Next-Day Host Settlements</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Property owners and station hosts receive payouts for completed parking and charging reservations on the very next calendar day via Razorpay automated settlement ledger.
            </p>
          </div>

          <div className="p-6 bg-white border-2 border-neutral-200 hover:border-black hover:shadow-lg rounded-3xl transition space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-black text-yellow-400 flex items-center justify-center shadow-xs">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-neutral-900">Digital PIN Barrier Access</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Instant entry without gatekeeper delays. Every confirmed booking issues an encrypted 4-digit PIN for boom barriers, automatic gates, and basement parking lifts.
            </p>
          </div>

          <div className="p-6 bg-white border-2 border-neutral-200 hover:border-black hover:shadow-lg rounded-3xl transition space-y-3 md:col-span-2 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black flex items-center justify-center shadow-xs">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-black text-neutral-900">Integrated Destination & Hangout Engine</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Turn charging downtime into productive leisure. VFlow highlights artisan cafes, lounges, retail hubs, and workspaces within a 5-minute stroll of your selected charging bay.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMPREHENSIVE BLOG & ARTICLE SECTION (ON MAIN WEBSITE)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 border-t border-neutral-200 pt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="inline-block text-[11px] font-black uppercase tracking-widest text-neutral-900 px-3 py-1 rounded-full bg-yellow-400 border border-yellow-500/20 mb-2 shadow-xs">
              VFlow Knowledge Hub
            </div>
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
              EV Insights, Charging Watts & Host Guides
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              Deep dive into electric mobility wattage, connector types, and property monetization in India.
            </p>
          </div>
        </div>

        {/* Blog Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Article 1 */}
          <article className="bg-white border-2 border-neutral-200 rounded-3xl overflow-hidden hover:border-black hover:shadow-lg transition flex flex-col justify-between shadow-xs">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-neutral-900 font-black">
                <span className="bg-yellow-100 text-black px-2 py-0.5 rounded-full border border-yellow-300">Watts & Charging Speeds</span>
                <span className="text-neutral-500">5 min read</span>
              </div>
              <h3 className="text-base font-black text-neutral-900 hover:text-black transition">
                Decoding EV Watts: How 7.2 kW AC vs 60 kW DC Charging Impacts Battery Life
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Understand the difference between onboard alternating current (AC) converters and high-voltage direct current (DC) fast chargers. Discover why higher wattage charges your battery from 10% to 80% in 45 minutes without premature degradation.
              </p>
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-black text-neutral-900 group">
              <span>Read Full Article</span>
              <div className="w-7 h-7 rounded-full bg-yellow-400 text-black flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </article>

          {/* Article 2 */}
          <article className="bg-white border-2 border-neutral-200 rounded-3xl overflow-hidden hover:border-black hover:shadow-lg transition flex flex-col justify-between shadow-xs">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-neutral-900 font-black">
                <span className="bg-yellow-100 text-black px-2 py-0.5 rounded-full border border-yellow-300">Property Monetization</span>
                <span className="text-neutral-500">4 min read</span>
              </div>
              <h3 className="text-base font-black text-neutral-900 hover:text-black transition">
                How Commercial & Residential Hosts Earn ₹45,000+ Monthly With VFlow
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Whether you have an empty office driveway or a residential apartment stilt lot, learn how hosts install certified EV wallboxes, establish custom hourly parking fees, and enjoy next-day automated bank transfers directly through VFlow.
              </p>
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-black text-neutral-900 group">
              <span>Read Full Article</span>
              <div className="w-7 h-7 rounded-full bg-yellow-400 text-black flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </article>

          {/* Article 3 */}
          <article className="bg-white border-2 border-neutral-200 rounded-3xl overflow-hidden hover:border-black hover:shadow-lg transition flex flex-col justify-between shadow-xs">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-neutral-900 font-black">
                <span className="bg-yellow-100 text-black px-2 py-0.5 rounded-full border border-yellow-300">Plugs & Compatibility</span>
                <span className="text-neutral-500">6 min read</span>
              </div>
              <h3 className="text-base font-black text-neutral-900 hover:text-black transition">
                The Indian EV Connector Guide: CCS2, Type 2, Bharat DC-001 & 15A Sockets
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                India's EV landscape features multiple standard plugs. Find out which cars use CCS-2 Combo, why European Type 2 cables dominate three-phase AC, and how electric two-wheelers leverage proprietary fast ports or domestic 15A wall plugs.
              </p>
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-black text-neutral-900 group">
              <span>Read Full Article</span>
              <div className="w-7 h-7 rounded-full bg-yellow-400 text-black flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* =========================================================================
          NEARBY PROVIDERS SECTION (AT THE BOTTOM OF THE PAGE)
          ========================================================================= */}
      <section id="nearby-providers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 border-t border-neutral-200 pt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-neutral-900 px-3 py-1 rounded-full bg-yellow-400 border border-yellow-500/20 mb-2 shadow-xs">
              <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Real-Time Verified Listings</span>
            </div>
            <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
              Nearby Providers & Charging Hubs
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              {selectedVehicle
                ? `Showing verified locations matching ${selectedVehicle.manufacturer} ${selectedVehicle.model} (${selectedVehicle.maxDcPowerKw || 50} kW DC)`
                : 'Browse available parking bays and high-speed EV stations across your city'}
            </p>
          </div>

          {/* Quick Filter Buttons: Black and Yellow buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServiceFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 ${
                serviceFilter === 'all'
                  ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/30'
                  : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-300'
              }`}
            >
              All Providers
            </button>
            <button
              onClick={() => setServiceFilter('charging')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 active:scale-95 ${
                serviceFilter === 'charging'
                  ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/30'
                  : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current stroke-current" />
              <span>EV Charging</span>
            </button>
            <button
              onClick={() => setServiceFilter('parking')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 active:scale-95 ${
                serviceFilter === 'parking'
                  ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/30'
                  : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border border-neutral-300'
              }`}
            >
              <Car className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Parking Only</span>
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-neutral-100 rounded-3xl animate-pulse border border-neutral-200" />
            ))}
          </div>
        ) : listingsData && listingsData.listings && listingsData.listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listingsData.listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-neutral-50 rounded-3xl border border-neutral-200 space-y-3">
            <Car className="w-10 h-10 text-neutral-400 mx-auto" />
            <h4 className="font-black text-neutral-900 text-base">No providers found for current filter</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
              Try switching between EV Charging and Parking Only or explore listings across Bangalore.
            </p>
            <button
              onClick={() => setServiceFilter('all')}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-xl shadow-xs transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
