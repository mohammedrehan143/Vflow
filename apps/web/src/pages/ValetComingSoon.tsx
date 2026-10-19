import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Car,
  Zap,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileText,
} from 'lucide-react';

export const ValetComingSoon: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [vehicleModel, setVehicleModel] = useState('');
  const [interestedIn, setInterestedIn] = useState<'valet_parking' | 'valet_charging' | 'fleet_services'>('valet_parking');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setErrorMessage('Please consent to receive launch notifications.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await api.waitlist.submit({
        name,
        email,
        phone,
        city,
        vehicleModel,
        interestedIn,
      });

      if (res.success) {
        setSuccessMessage('Thank you! You have been added to the VFlow Valet Priority Waitlist.');
        setName('');
        setEmail('');
        phone && setPhone('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit waitlist registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-8 sm:p-14 border border-amber-500/20 shadow-2xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Launch Feature Preview</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            VFlow Valet & Charging Concierge
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Never waste time circling for parking or waiting at high-speed charging hubs. Our upcoming professional valet specialists will meet you at your destination, safely park, and recharge your vehicle.
          </p>

          <div className="inline-block px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
            ⚠️ <strong>Operational Notice:</strong> Valet reservations, driver dispatch, and transactions are currently disabled in compliance with VFlow MVP specifications. Join our waitlist below for exclusive beta access.
          </div>
        </div>
      </div>

      {/* Feature Architecture Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Digital Vehicle Handover</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Multi-angle photo inspections, odometer capture, and cryptographically verified OTP handovers ensure your car is guarded with complete transparency.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Plug-in & Fast Charge</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Valets connect your electric car to verified fast-charging ports, track telemetry to the required state-of-charge, and return it ready for the road.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Comprehensive Protection</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every vetted driver undergoes criminal background checks, motor-vehicle licensing verification, and specialized electric vehicle training.
          </p>
        </div>
      </div>

      {/* Priority Waitlist Registration Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Join the Priority Beta Waitlist</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Be the first to experience seamless valet parking in Bangalore and Mumbai.
          </p>
        </div>

        {successMessage ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-950 text-base">{successMessage}</h4>
            <p className="text-xs text-emerald-800">
              We will notify you via email and WhatsApp as soon as slots open up in {city}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi-NCR">Delhi-NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Make / Model (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Tata Nexon EV Max, MG ZS EV, BMW i4"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Consent checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  required
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I consent to receive launch notifications and early invite access for VFlow Valet Mobility in my city.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-md transition text-xs sm:text-sm"
            >
              {isSubmitting ? 'Submitting Waitlist...' : 'Join Priority Valet Waitlist'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
