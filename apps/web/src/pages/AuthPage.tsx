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

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (!phone.trim()) {
        setErrorMessage('Please enter your mobile phone number');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login({
          identifier: identifier.trim(),
          password,
          remember: rememberSession,
        });

        if (res.user?.role === 'provider') {
          navigate('/provider/dashboard');
        } else if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const computedEmail = email.trim() || `${phone.replace(/\D/g, '')}@vflow-user.in`;
        await register({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: computedEmail,
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
    <div className="min-h-screen bg-white text-neutral-900 px-4 py-12 flex flex-col justify-center max-w-md mx-auto space-y-6">
      {/* Brand logo */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-md shadow-yellow-400/30">
          <Zap className="w-6 h-6 fill-black stroke-black" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
          {mode === 'login' ? 'Welcome Back to VFlow' : 'Create Your VFlow Account'}
        </h1>
        <p className="text-xs text-neutral-500 font-medium">
          Seamless parking reservations and EV fast charging across India
        </p>
      </div>

      {/* Instant Demo Sign-In Box */}
      <div className="bg-neutral-50 border-2 border-neutral-200 rounded-2xl p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Quick 1-Click Role Login</span>
        </div>
        <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">
          Test the platform instantaneously with pre-configured accounts:
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoSelect('customer')}
            className="py-2 px-2 rounded-xl bg-black hover:bg-neutral-800 text-white hover:text-yellow-400 text-xs font-black transition active:scale-95 shadow-xs"
          >
            🚗 Driver
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('provider')}
            className="py-2 px-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black transition border border-yellow-500/20 active:scale-95 shadow-xs"
          >
            ⚡ Host
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('admin')}
            className="py-2 px-2 rounded-xl bg-black hover:bg-neutral-800 text-white hover:text-yellow-400 text-xs font-black transition active:scale-95 shadow-xs"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white rounded-3xl border-2 border-neutral-200 shadow-xl p-6 sm:p-8 space-y-5 text-neutral-900">
        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg text-xs font-black transition ${
              mode === 'login' ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20' : 'text-neutral-600 hover:text-black'
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
              mode === 'register' ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {verificationNotice && (
          <div className="p-3 bg-yellow-50 border border-yellow-300 text-neutral-900 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>{verificationNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' ? (
            <>
              <div>
                <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Verma"
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-semibold focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number (e.g. 9876543210)"
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-semibold focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Optional email address"
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-semibold focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your mobile number or email"
                  className="w-full text-xs p-3 pl-9 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-semibold focus:outline-none focus:border-black"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-black text-neutral-900 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 pl-9 pr-10 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-semibold focus:outline-none focus:border-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-500 hover:text-black"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-black text-neutral-700 uppercase tracking-wider mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-3 pl-9 pr-10 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-semibold focus:outline-none focus:border-black"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-black"
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
              className="w-4 h-4 accent-black rounded"
            />
            <label htmlFor="remember" className="text-xs text-neutral-600 select-none cursor-pointer font-bold">
              Always remember my sign up on this device
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-3.5 px-4 rounded-xl shadow-xs border border-yellow-500/20 transition active:scale-95 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In to Account' : 'Create Account & Start'}
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* Post-Registration Role Selection Modal */}
      {showRoleSelection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-neutral-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-neutral-900">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-yellow-400 text-black rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h2 className="text-xl font-black text-neutral-900">Choose Your VFlow Profile</h2>
              <p className="text-xs text-neutral-500 font-medium">
                You can switch between customer and host services anytime in your account settings.
              </p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setRegisteredRole('customer')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                  registeredRole === 'customer'
                    ? 'border-black bg-yellow-50/70 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="p-2.5 bg-yellow-400 text-black rounded-xl mt-0.5 font-bold shadow-xs">
                  <Car className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-sm font-black text-neutral-900">Customer / Driver</div>
                  <div className="text-xs text-neutral-600 mt-0.5 leading-relaxed font-medium">
                    Search and reserve parking spaces and EV fast-charging ports with instant Razorpay checkout.
                  </div>
                </div>
              </div>

              <div
                onClick={() => setRegisteredRole('provider')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
                  registeredRole === 'provider'
                    ? 'border-black bg-yellow-50/70 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="p-2.5 bg-black text-yellow-400 rounded-xl mt-0.5 font-bold shadow-xs">
                  <Building2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-sm font-black text-neutral-900">Parking / Charging Host</div>
                  <div className="text-xs text-neutral-600 mt-0.5 leading-relaxed font-medium">
                    List bays and EV wallbox ports, monitor earnings, and receive automated next-day bank transfers.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleRoleConfirm}
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3.5 rounded-xl shadow-xs border border-yellow-500/20 text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
            >
              Confirm Profile & Continue
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-neutral-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-neutral-900">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSubmitted(false);
                setForgotMessage(null);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center shadow-xs">
                <KeyRound className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-neutral-900 text-base">Reset Password</h3>
                <p className="text-xs text-neutral-500 font-medium">Receive password reset instructions</p>
              </div>
            </div>

            {forgotMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  forgotSubmitted
                    ? 'bg-yellow-50 border border-yellow-300 text-neutral-900'
                    : 'bg-red-50 border border-red-200 text-red-700'
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
                  className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 focus:outline-none focus:border-black font-semibold"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow-xs border border-yellow-500/20"
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
