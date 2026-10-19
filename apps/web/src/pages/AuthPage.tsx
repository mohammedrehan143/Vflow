import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
  Eye,
  EyeOff,
  Car,
  Building2,
  KeyRound,
  X,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const { login, register, selectRole, quickDemoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Post-registration role selection modal / state
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<'customer' | 'provider'>('customer');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  // Email verification alert
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setVerificationNotice(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter identical passwords.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(identifier || email, password, rememberSession);
        navigate('/');
      } else {
        await register({
          fullName,
          phone,
          email: email.trim() || undefined,
          password,
          role: 'customer',
        });
        setShowRoleSelection(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleConfirm = async () => {
    setIsLoading(true);
    try {
      await selectRole(registeredRole);
      setShowRoleSelection(false);
      if (registeredRole === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to select role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.auth.forgotPassword(forgotEmail);
      setForgotSubmitted(true);
      setForgotMessage(res.message || 'Password reset instructions sent.');
    } catch (err: any) {
      setForgotMessage(err.message || 'Failed to send password reset request');
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
        navigate('/');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 flex flex-col justify-center max-w-md mx-auto space-y-6">
      {/* Brand logo */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-lg shadow-yellow-400/20">
          <Zap className="w-6 h-6 fill-black" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {mode === 'login' ? 'Welcome Back to VFlow' : 'Create Your VFlow Account'}
        </h1>
        <p className="text-xs text-neutral-400">
          Seamless parking reservations and EV fast charging across India
        </p>
      </div>

      {/* Instant Demo Sign-In Box */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-yellow-400" />
          <span>Quick 1-Click Role Login</span>
        </div>
        <p className="text-[11px] text-neutral-300 leading-relaxed">
          Test the platform instantaneously with pre-configured accounts:
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoSelect('customer')}
            className="py-1.5 px-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-200 text-xs font-bold transition border border-neutral-800 hover:border-yellow-400"
          >
            🚗 Driver
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('provider')}
            className="py-1.5 px-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-200 text-xs font-bold transition border border-neutral-800 hover:border-yellow-400"
          >
            ⚡ Host
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('admin')}
            className="py-1.5 px-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-200 text-xs font-bold transition border border-neutral-800 hover:border-yellow-400"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-5">
        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-black rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg text-xs font-black transition ${
              mode === 'login' ? 'bg-yellow-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
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
            className={`py-2 rounded-lg text-xs font-black transition ${
              mode === 'register' ? 'bg-yellow-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {verificationNotice && (
          <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-yellow-400" />
            <span>{verificationNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' ? (
            <>
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Verma"
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-black border border-neutral-700 text-white font-semibold focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number (e.g. 9876543210)"
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-black border border-neutral-700 text-white font-semibold focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                  Email Address <span className="text-neutral-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Optional email address"
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-black border border-neutral-700 text-white font-semibold focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your mobile number or email"
                  className="w-full text-xs p-3 pl-9 rounded-xl bg-black border border-neutral-700 text-white font-semibold focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-yellow-400 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 pl-9 pr-10 rounded-xl bg-black border border-neutral-700 text-white font-semibold focus:outline-none focus:border-yellow-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-3 pl-9 pr-10 rounded-xl bg-black border border-neutral-700 text-white font-semibold focus:outline-none focus:border-yellow-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberSession}
              onChange={(e) => setRememberSession(e.target.checked)}
              className="w-4 h-4 accent-yellow-400 rounded bg-black border-neutral-700"
            />
            <label htmlFor="remember" className="text-xs text-neutral-300 select-none cursor-pointer">
              Always remember my sign up on this device
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-3.5 px-4 rounded-xl shadow-lg shadow-yellow-400/20 transition active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In to Account' : 'Create Account & Start'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Post-Registration Role Selection Modal */}
      {showRoleSelection && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-yellow-400 text-black rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">Choose Your VFlow Profile</h2>
              <p className="text-xs text-neutral-400">
                You can switch between customer and host services anytime in your account settings.
              </p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setRegisteredRole('customer')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                  registeredRole === 'customer'
                    ? 'border-yellow-400 bg-neutral-950'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="p-2.5 bg-yellow-400 text-black rounded-xl mt-0.5 font-bold">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Customer / Driver</div>
                  <div className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Search and reserve parking spaces and EV fast-charging ports with instant Razorpay checkout.
                  </div>
                </div>
              </div>

              <div
                onClick={() => setRegisteredRole('provider')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                  registeredRole === 'provider'
                    ? 'border-yellow-400 bg-neutral-950'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="p-2.5 bg-yellow-400 text-black rounded-xl mt-0.5 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Parking / Charging Host</div>
                  <div className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    List bays and EV wallbox ports, monitor earnings, and receive automated next-day bank transfers.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleRoleConfirm}
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3.5 rounded-xl shadow-lg shadow-yellow-400/20 text-xs uppercase tracking-wider transition active:scale-95"
            >
              Confirm Profile & Continue
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-white">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSubmitted(false);
                setForgotMessage(null);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Reset Password</h3>
                <p className="text-xs text-neutral-400">Receive password reset instructions</p>
              </div>
            </div>

            {forgotMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  forgotSubmitted
                    ? 'bg-yellow-400/10 border border-yellow-400/30 text-yellow-400'
                    : 'bg-red-950/40 border border-red-800/60 text-red-300'
                }`}
              >
                {forgotMessage}
              </div>
            )}

            {!forgotSubmitted && (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="text"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your mobile or email"
                  className="w-full text-xs p-3 rounded-xl bg-black border border-neutral-700 text-white focus:outline-none focus:border-yellow-400"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
