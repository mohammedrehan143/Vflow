import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  Car,
  Zap,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { ProviderType, ServiceType } from '@vflow/shared';

export const BecomeAHost: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [providerType, setProviderType] = useState<ProviderType>('individual');
  const [displayName, setDisplayName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [businessName, setBusinessName] = useState('');
  
  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('');

  // Service types offered
  const [parkingOffered, setParkingOffered] = useState(true);
  const [chargingOffered, setChargingOffered] = useState(true);

  // Payout configuration (Section 5 & 9)
  const [accountHolderName, setAccountHolderName] = useState(user?.fullName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const serviceTypes: ServiceType[] = [];
    if (parkingOffered && chargingOffered) {
      serviceTypes.push('combined');
    } else if (parkingOffered) {
      serviceTypes.push('parking');
    } else if (chargingOffered) {
      serviceTypes.push('charging');
    }

    if (serviceTypes.length === 0) {
      setErrorMessage('Please select at least one service type to offer.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.provider.register({
        providerType,
        displayName,
        email,
        phone,
        businessName: businessName || undefined,
        address: {
          street,
          city,
          state,
          postalCode,
          country: 'India',
        },
        serviceAreas: [city],
        serviceTypes,
        payoutConfiguration: {
          accountHolderName,
          bankAccountNumber: bankAccountNumber || undefined,
          ifscCode: ifscCode || undefined,
          upiId: upiId || undefined,
          payoutMethod: 'manual_bank_transfer',
        },
      });

      if (res.success) {
        navigate('/provider/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete provider registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
          <Building className="w-3.5 h-3.5" />
          <span>Host Onboarding</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-1">
          List Your Parking Spaces & EV Chargers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Join India's premier mobility marketplace with guaranteed next-day earnings settlement.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Section 1: Provider Identity */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Profile & Business Type
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'individual', label: 'Individual / Homeowner' },
              { id: 'business', label: 'Business / Commercial' },
              { id: 'parking_operator', label: 'Parking Operator' },
              { id: 'ev_operator', label: 'EV Station Host' },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setProviderType(t.id as ProviderType)}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                  providerType === t.id
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Host Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. GreenPark Hubs or Rajesh Sharma"
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Name (Optional)</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="GreenPark Mobility LLP"
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address & Service Offerings */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Location & Services Offered
          </h3>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={parkingOffered}
                onChange={(e) => setParkingOffered(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span>Parking Spaces</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={chargingOffered}
                onChange={(e) => setChargingOffered(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span>EV Charging Infrastructure</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="12 80ft Road, Indiranagar"
              className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold cursor-pointer"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi-NCR">Delhi-NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN / Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="560038"
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Next-Day Payout Account Details (Section 5 & 9) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-base font-bold text-slate-900">
              3. Next-Day Settlement Account (Bank / UPI)
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Automated Next-Day Payouts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary Account Name</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Anita Desai"
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID (VPA)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@okaxis"
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="50100234567890"
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="HDFC0001234"
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold uppercase"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Registering Host Account...' : 'Complete Host Onboarding'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
