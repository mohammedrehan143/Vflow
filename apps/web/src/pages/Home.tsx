import React, { useState, useEffect } from 'react';
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
  BookmarkCheck,
  Compass,
  BatteryCharging,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  IVehicle,
  CustomerVehicleType,
  ConnectorType,
} from '@vflow/shared';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register, quickDemoLogin } = useAuth();

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

  // Handle Quick Signup / Sign In
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authTab === 'signup') {
        if (!authName.trim()) {
          throw new Error('Please enter your full name');
        }
        if (!authPhone.trim() || authPhone.replace(/\D/g, '').length < 10) {
          throw new Error('Please enter a valid 10-digit mobile number');
        }
        if (authPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        await register({
          fullName: authName.trim(),
          phone: authPhone.trim(),
          password: authPassword,
          role: 'customer',
        });
      } else {
        if (!authPhone.trim()) {
          throw new Error('Please enter your mobile number or email');
        }
        if (!authPassword) {
          throw new Error('Please enter your password');
        }

        await login(authPhone.trim(), authPassword, authRemember);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Save Car & Watts
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
    <div className="min-h-screen bg-black text-white space-y-16 pb-24 selection:bg-yellow-400 selection:text-black">
      {/* =========================================================================
          HERO & ONBOARDING SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
        {/* Yellow ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-32 left-1/3 w-96 h-96 bg-yellow-400 rounded-full blur-[140px]"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-[140px]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Brand Message & Pitch */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              India's Premier Parking & High-Speed EV Charging Network
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              Find Parking.{' '}
              <span className="text-yellow-400 block sm:inline">Fast EV Charging.</span>{' '}
              <span className="text-neutral-400 text-3xl sm:text-5xl block mt-1">Explore Nearby.</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
              Reserve guaranteed private parking bays and fast EV chargers in seconds. High-voltage charging from 3.3 kW to 150 kW DC, verified host bays, and instantaneous barrier PIN entry.
            </p>

            {/* Platform Trust Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
                <div className="text-yellow-400 font-black text-xl">100%</div>
                <div className="text-[11px] text-neutral-400 font-semibold uppercase">Guaranteed Bays</div>
              </div>
              <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
                <div className="text-yellow-400 font-black text-xl">150 kW</div>
                <div className="text-[11px] text-neutral-400 font-semibold uppercase">DC Fast Charging</div>
              </div>
              <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
                <div className="text-yellow-400 font-black text-xl">Next-Day</div>
                <div className="text-[11px] text-neutral-400 font-semibold uppercase">Host Settlements</div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form (Sign Up / Sign In OR Car Onboarding Prompt) */}
          <div className="lg:col-span-5">
            {!isAuthenticated ? (
              /* ================= GUEST SIGN UP / SIGN IN WIDGET ================= */
              <div className="bg-neutral-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-2xl shadow-yellow-400/5 space-y-5">
                {/* Tab Switcher */}
                <div className="grid grid-cols-2 p-1 bg-black rounded-2xl border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signup');
                      setAuthError(null);
                    }}
                    className={`py-2 text-xs font-black rounded-xl transition ${
                      authTab === 'signup'
                        ? 'bg-yellow-400 text-black shadow-md'
                        : 'text-neutral-400 hover:text-white'
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
                        ? 'bg-yellow-400 text-black shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">
                    {authTab === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {authTab === 'signup'
                      ? 'Sign up with your mobile number to unlock instant reservations.'
                      : 'Sign in to access your saved vehicles and reserved spots.'}
                  </p>
                </div>

                {authError && (
                  <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authTab === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Aditya Sharma"
                          className="w-full bg-black text-white text-xs rounded-xl pl-10 pr-3.5 py-2.5 border border-neutral-700 focus:outline-none focus:border-yellow-400 transition"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                      {authTab === 'signup' ? 'Mobile Number' : 'Mobile Number or Email'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder={authTab === 'signup' ? '10-digit mobile (e.g. 9876543210)' : 'Mobile number or email'}
                        className="w-full bg-black text-white text-xs rounded-xl pl-10 pr-3.5 py-2.5 border border-neutral-700 focus:outline-none focus:border-yellow-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black text-white text-xs rounded-xl pl-10 pr-3.5 py-2.5 border border-neutral-700 focus:outline-none focus:border-yellow-400 transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                      <input
                        type="checkbox"
                        checked={authRemember}
                        onChange={(e) => setAuthRemember(e.target.checked)}
                        className="w-4 h-4 accent-yellow-400 rounded bg-black border-neutral-700 cursor-pointer"
                      />
                      <span className="text-[11px] font-medium">Always remember this session</span>
                    </label>

                    {authTab === 'login' && (
                      <Link to="/auth" className="text-[11px] font-bold text-yellow-400 hover:underline">
                        Forgot Password?
                      </Link>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-400/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{authLoading ? 'Verifying...' : authTab === 'signup' ? 'Create Account & Start' : 'Sign In Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick 1-Click Demo Login */}
                <div className="pt-2 border-t border-neutral-800 text-center space-y-2">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Or Demo 1-Click Login</span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('customer')}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold border border-neutral-700"
                    >
                      Driver Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => quickDemoLogin('provider')}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold border border-neutral-700"
                    >
                      Host Demo
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= LOGGED-IN VEHICLE & WATTS CARD ================= */
              <div className="bg-neutral-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-yellow-400/40 shadow-2xl shadow-yellow-400/10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-yellow-400 text-black font-black flex items-center justify-center">
                      <Zap className="w-5 h-5 fill-black" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">
                        Welcome, {user?.fullName.split(' ')[0]}!
                      </h3>
                      <p className="text-xs text-neutral-400">Driver Account Active</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                    Logged In
                  </span>
                </div>

                {/* Active Vehicle Status */}
                {selectedVehicle && !showCarForm ? (
                  <div className="p-4 rounded-2xl bg-black border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-yellow-400" />
                        <div>
                          <span className="font-extrabold text-sm text-white block">
                            {selectedVehicle.manufacturer} {selectedVehicle.model}
                          </span>
                          <span className="text-[11px] text-neutral-400 capitalize">
                            {selectedVehicle.vehicleType.replace(/_/g, ' ')}
                            {selectedVehicle.registrationNumber ? ` · ${selectedVehicle.registrationNumber}` : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-yellow-400 text-black">
                        Default
                      </span>
                    </div>

                    {/* Watts and Ports Specs Pill */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-900 text-xs">
                      <div className="p-2 bg-neutral-900/80 rounded-xl border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Max AC Power</span>
                        <span className="font-black text-yellow-400 text-sm">{selectedVehicle.maxAcPowerKw || 7.2} kW</span>
                      </div>
                      <div className="p-2 bg-neutral-900/80 rounded-xl border border-neutral-800">
                        <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Max DC Fast</span>
                        <span className="font-black text-yellow-400 text-sm">{selectedVehicle.maxDcPowerKw || 50} kW</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-400">
                      <span className="text-neutral-500 font-bold uppercase mr-1">Plugs:</span>
                      {selectedVehicle.supportedConnectorTypes?.join(', ') || 'CCS2, Type 2'}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowCarForm(true)}
                        className="text-xs font-bold text-yellow-400 hover:text-white flex items-center gap-1 transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Update Car & Watts</span>
                      </button>
                      <Link
                        to="/vehicles"
                        className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition"
                      >
                        <span>Manage All Vehicles ({vehicles.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* ================= CAR & WATTS ONBOARDING FORM ================= */
                  <form onSubmit={handleSaveCar} className="space-y-4">
                    <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl">
                      <span className="font-black text-xs text-yellow-400 uppercase tracking-wide block">
                        Vehicle & Charging Specification
                      </span>
                      <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                        Specify your car type and charging wattage (kW) so VFlow can automatically match 100% compatible chargers and parking bays.
                      </p>
                    </div>

                    {carSuccessMsg && (
                      <div className="p-2.5 bg-yellow-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{carSuccessMsg}</span>
                      </div>
                    )}

                    {/* Car Type Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                        1. Type of Car / Vehicle
                      </label>
                      <select
                        value={carType}
                        onChange={(e) => setCarType(e.target.value as CustomerVehicleType)}
                        className="w-full bg-black text-white text-xs rounded-xl px-3 py-2.5 border border-neutral-700 focus:outline-none focus:border-yellow-400"
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
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
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
                            className={`p-1.5 rounded-lg text-[11px] font-bold transition border ${
                              carModel === preset
                                ? 'bg-yellow-400 text-black border-yellow-400'
                                : 'bg-black text-neutral-300 border-neutral-800 hover:border-neutral-700'
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
                          className="w-full bg-black text-white text-xs rounded-xl px-3 py-2 border border-neutral-700 focus:outline-none focus:border-yellow-400 mt-1"
                        />
                      )}
                    </div>

                    {/* Watts / Power Limits */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                          Max AC Watts (kW)
                        </label>
                        <select
                          value={maxAcKw}
                          onChange={(e) => setMaxAcKw(e.target.value)}
                          className="w-full bg-black text-white text-xs rounded-xl px-3 py-2 border border-neutral-700 focus:outline-none focus:border-yellow-400"
                        >
                          <option value="3.3">3.3 kW (Slow AC)</option>
                          <option value="7.2">7.2 kW (Home Wallbox)</option>
                          <option value="11">11 kW (Three Phase)</option>
                          <option value="22">22 kW (Commercial AC)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                          Max DC Watts (kW)
                        </label>
                        <select
                          value={maxDcKw}
                          onChange={(e) => setMaxDcKw(e.target.value)}
                          className="w-full bg-black text-white text-xs rounded-xl px-3 py-2 border border-neutral-700 focus:outline-none focus:border-yellow-400"
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
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                        Connector Inlets
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['CCS2', 'Type 2', 'CHAdeMO', 'Bharat DC-001', '15A_3Pin'] as ConnectorType[]).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleConnector(c)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition border ${
                              selectedConnectors.includes(c)
                                ? 'bg-yellow-400 text-black border-yellow-400'
                                : 'bg-black text-neutral-400 border-neutral-800'
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
                        className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
                      >
                        {savingCar ? 'Saving...' : 'Save & Show Compatible Providers'}
                      </button>
                      {selectedVehicle && (
                        <button
                          type="button"
                          onClick={() => setShowCarForm(false)}
                          className="px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl"
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
          <div className="inline-block text-[11px] font-black uppercase tracking-widest text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            About VFlow Mobility
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Comprehensive Urban Parking & EV Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Everything you need to know about the platform: from secure barrier digital PIN entries to high-voltage EV chargers and automated next-day host earnings.
          </p>
        </div>

        {/* 5 Architecture Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-neutral-900 border border-neutral-800 hover:border-yellow-400/40 rounded-3xl transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Dual Booking Marketplace</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Book parking slots by the hour or day, high-power EV charging wallboxes, or bundled spaces with dedicated charger ports. Guaranteed reserved bays with no street hunting.
            </p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 hover:border-yellow-400/40 rounded-3xl transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Power & Watts Compatibility Engine</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              VFlow verifies your car's AC and DC charging limits against the station's rated power. Overbooking prevention models each physical connector as an independent resource.
            </p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 hover:border-yellow-400/40 rounded-3xl transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Guaranteed Next-Day Host Settlements</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Property owners and station hosts receive payouts for completed parking and charging reservations on the very next calendar day via Razorpay automated settlement ledger.
            </p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 hover:border-yellow-400/40 rounded-3xl transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Digital PIN Barrier Access</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Instant entry without gatekeeper delays. Every confirmed booking issues an encrypted 4-digit PIN for boom barriers, automatic gates, and basement parking lifts.
            </p>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 hover:border-yellow-400/40 rounded-3xl transition space-y-3 md:col-span-2">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Integrated Destination & Hangout Engine</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Turn charging downtime into productive leisure. VFlow highlights artisan cafes, lounges, retail hubs, and workspaces within a 5-minute stroll of your selected charging bay.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMPREHENSIVE BLOG & ARTICLE SECTION (ON MAIN WEBSITE)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 border-t border-neutral-800 pt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="inline-block text-[11px] font-black uppercase tracking-widest text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-2">
              VFlow Knowledge Hub
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              EV Insights, Charging Watts & Host Guides
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Deep dive into electric mobility wattage, connector types, and property monetization in India.
            </p>
          </div>
        </div>

        {/* Blog Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Article 1 */}
          <article className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden hover:border-yellow-400/50 transition flex flex-col justify-between">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-yellow-400 font-bold">
                <span>Watts & Charging Speeds</span>
                <span>5 min read</span>
              </div>
              <h3 className="text-base font-black text-white hover:text-yellow-400 transition">
                Decoding EV Watts: How 7.2 kW AC vs 60 kW DC Charging Impacts Battery Life
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Understand the difference between onboard alternating current (AC) converters and high-voltage direct current (DC) fast chargers. Discover why higher wattage charges your battery from 10% to 80% in 45 minutes without premature degradation.
              </p>
            </div>
            <div className="px-6 pb-6 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs font-bold text-yellow-400">
              <span>Read Full Article</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </article>

          {/* Article 2 */}
          <article className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden hover:border-yellow-400/50 transition flex flex-col justify-between">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-yellow-400 font-bold">
                <span>Property Monetization</span>
                <span>4 min read</span>
              </div>
              <h3 className="text-base font-black text-white hover:text-yellow-400 transition">
                How Commercial & Residential Hosts Earn ₹45,000+ Monthly With VFlow
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Whether you have an empty office driveway or a residential apartment stilt lot, learn how hosts install certified EV wallboxes, establish custom hourly parking fees, and enjoy next-day automated bank transfers directly through VFlow.
              </p>
            </div>
            <div className="px-6 pb-6 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs font-bold text-yellow-400">
              <span>Read Full Article</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </article>

          {/* Article 3 */}
          <article className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden hover:border-yellow-400/50 transition flex flex-col justify-between">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-yellow-400 font-bold">
                <span>Plugs & Compatibility</span>
                <span>6 min read</span>
              </div>
              <h3 className="text-base font-black text-white hover:text-yellow-400 transition">
                The Indian EV Connector Guide: CCS2, Type 2, Bharat DC-001 & 15A Sockets
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                India's EV landscape features multiple standard plugs. Find out which cars use CCS-2 Combo, why European Type 2 cables dominate three-phase AC, and how electric two-wheelers leverage proprietary fast ports or domestic 15A wall plugs.
              </p>
            </div>
            <div className="px-6 pb-6 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs font-bold text-yellow-400">
              <span>Read Full Article</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </article>
        </div>
      </section>

      {/* =========================================================================
          NEARBY PROVIDERS SECTION (AT THE BOTTOM OF THE PAGE)
          ========================================================================= */}
      <section id="nearby-providers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 border-t border-neutral-800 pt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Real-Time Verified Listings</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Nearby Providers & Charging Hubs
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {selectedVehicle
                ? `Showing verified locations matching ${selectedVehicle.manufacturer} ${selectedVehicle.model} (${selectedVehicle.maxDcPowerKw || 50} kW DC)`
                : 'Browse available parking bays and high-speed EV stations across your city'}
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServiceFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                serviceFilter === 'all'
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
              }`}
            >
              All Providers
            </button>
            <button
              onClick={() => setServiceFilter('charging')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
                serviceFilter === 'charging'
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>EV Charging</span>
            </button>
            <button
              onClick={() => setServiceFilter('parking')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
                serviceFilter === 'parking'
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Parking Only</span>
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-neutral-900 rounded-3xl animate-pulse border border-neutral-800" />
            ))}
          </div>
        ) : listingsData && listingsData.listings && listingsData.listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listingsData.listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-neutral-900/60 rounded-3xl border border-neutral-800 space-y-3">
            <Car className="w-10 h-10 text-neutral-600 mx-auto" />
            <h4 className="font-bold text-white text-base">No providers found for current filter</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Try switching between EV Charging and Parking Only or explore listings across Bangalore.
            </p>
            <button
              onClick={() => setServiceFilter('all')}
              className="px-4 py-2 bg-yellow-400 text-black font-extrabold text-xs rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
