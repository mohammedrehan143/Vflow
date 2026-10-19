import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const { login, register, quickDemoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          fullName,
          phone,
          role,
        });
      }
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = async (demoRole: 'customer' | 'provider' | 'admin') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await quickDemoLogin(demoRole);
      if (demoRole === 'provider') {
        navigate('/provider/dashboard');
      } else if (demoRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/parking');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      {/* Brand logo */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md">
          <Zap className="w-6 h-6 fill-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {mode === 'login' ? 'Welcome Back to VFlow' : 'Create Your VFlow Account'}
        </h1>
        <p className="text-xs text-slate-500">
          Seamless parking reservations and EV fast charging across India
        </p>
      </div>

      {/* 1-Click Quick Demo Sign In Box */}
      <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/80 p-4 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Instant Evaluator Demo Login</span>
        </div>
        <p className="text-[11px] text-emerald-800 leading-relaxed">
          Click any role below to sign in immediately with pre-configured verified accounts:
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoSelect('customer')}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-slate-900 text-xs font-bold border border-emerald-200 shadow-sm transition text-center"
          >
            🚗 Driver
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('provider')}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-slate-900 text-xs font-bold border border-emerald-200 shadow-sm transition text-center"
          >
            🅿️ Host
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('admin')}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white hover:bg-emerald-100 text-slate-900 text-xs font-bold border border-emerald-200 shadow-sm transition text-center"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Authentication Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Verma"
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Register As</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      role === 'customer'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🚗 Driver / Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      role === 'provider'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🅿️ Space / Charger Host
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-xs p-3 pl-9 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 pl-9 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition text-xs sm:text-sm flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Account' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
