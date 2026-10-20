import React, { useState, useRef } from 'react';
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
  Check,
  RotateCcw,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'otp';

  const { login, loginWithOtp, register, selectRole, quickDemoLogin } = useAuth();
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>(initialMode === 'otp' ? 'otp' : 'password');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Phone + OTP State (Hardcoded '123')
  const [otpPhone, setOtpPhone] = useState('');
  const [otpStage, setOtpStage] = useState<'input_phone' | 'enter_otp'>('input_phone');
  const [otpDigits, setOtpDigits] = useState(['', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const otpInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Form states (Password method)
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Post-registration role selection modal / state
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [registeredRole, setRegisteredRole] = useState<'customer' | 'provider'>('customer');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Phone + OTP submission
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpPhone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpError(null);
    setOtpDigits(['', '', '']);
    setOtpStage('enter_otp');
    setTimeout(() => {
      otpInputRefs[0].current?.focus();
    }, 100);
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpError(null);

    if (digit && index < 2) {
      otpInputRefs[index + 1].current?.focus();
    }

    if (digit && index === 2 && newDigits[0] && newDigits[1]) {
      verifyOtp(`${newDigits[0]}${newDigits[1]}${digit}`);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const verifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code !== '123') {
      setOtpError('Invalid OTP. Please enter 123');
      return;
    }

    setIsLoading(true);
    setOtpError(null);
    try {
      await loginWithOtp(otpPhone, '123');
      navigate('/');
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-white text-neutral-900 px-4 py-10 flex flex-col justify-center max-w-md mx-auto space-y-6">
      {/* Brand logo & Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-xs border border-neutral-900">
          <Zap className="w-6 h-6 fill-black stroke-black" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
          Welcome to VFlow
        </h1>
        <p className="text-xs text-neutral-500 font-medium">
          Fast EV charging hubs & guaranteed reserved parking across India
        </p>
      </div>

      {/* Auth Method Switcher: Fast Phone OTP vs Password */}
      <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
        <button
          type="button"
          onClick={() => {
            setAuthMethod('otp');
            setErrorMessage(null);
          }}
          className={`py-2 rounded-xl text-xs font-black transition ${
            authMethod === 'otp'
              ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          📱 Phone & OTP (123)
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod('password');
            setErrorMessage(null);
          }}
          className={`py-2 rounded-xl text-xs font-black transition ${
            authMethod === 'password'
              ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          🔑 Password Login
        </button>
      </div>

      {/* =========================================================================
          METHOD 1: PHONE & HARDCODED OTP '123' (Matching user screenshot)
          ========================================================================= */}
      {authMethod === 'otp' && (
        <div className="bg-white rounded-3xl border-2 border-neutral-200 shadow-xl p-6 sm:p-8 space-y-6 text-neutral-900">
          {otpStage === 'input_phone' ? (
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 text-left">
                Hello There 👋
              </h2>

              <form onSubmit={handleSendOtp} className="space-y-6">
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

                    <span className="text-lg font-bold text-neutral-900 select-none">+91</span>

                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={10}
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="w-full bg-transparent text-lg font-semibold tracking-wider text-neutral-900 focus:outline-none placeholder:text-neutral-300"
                    />
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed text-left font-medium">
                  By signing up, you accept VFlow's{' '}
                  <span className="font-bold text-neutral-900 underline underline-offset-2">Terms</span>,{' '}
                  <span className="font-bold text-neutral-900 underline underline-offset-2">Privacy and Policy</span>.
                </p>

                <button
                  type="submit"
                  disabled={otpPhone.length < 10}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-base rounded-2xl shadow-md transition active:scale-95 border border-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Send OTP</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-2xl font-black text-neutral-900">
                  Verify Phone 🔐
                </h2>
                <p className="text-xs text-neutral-600 mt-1 font-medium">
                  We sent a 3-digit verification code to <span className="font-bold text-neutral-900">+91 {otpPhone}</span>
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
              <div className="flex items-center justify-center gap-4 py-2">
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="tel"
                    maxLength={1}
                    value={otpDigits[idx]}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-16 h-18 text-center text-3xl font-black rounded-2xl bg-neutral-50 border-2 border-neutral-300 focus:border-neutral-900 focus:bg-white text-neutral-900 outline-none transition shadow-xs"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
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
                  <span>Resend Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOtpStage('input_phone')}
                  className="font-bold text-neutral-900 hover:underline"
                >
                  Change Number
                </button>
              </div>

              <button
                type="button"
                onClick={() => verifyOtp()}
                disabled={isLoading || otpDigits.some((d) => !d)}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-base rounded-2xl shadow-md transition active:scale-95 border border-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Verify OTP'}</span>
                <Check className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          METHOD 2: STANDARD EMAIL / PASSWORD (With Demo 1-Click bypass)
          ========================================================================= */}
      {authMethod === 'password' && (
        <div className="bg-white rounded-3xl border-2 border-neutral-200 shadow-xl p-6 sm:p-8 space-y-5 text-neutral-900">
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

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
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
                      placeholder="10-digit mobile number"
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
                      placeholder="aditya@vflow.in"
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
                  className="absolute right-3 top-3 text-neutral-400 hover:text-black"
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
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-semibold focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xs border border-yellow-500/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      )}

      {/* Instant 1-Click Demo Logins */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-center space-y-2">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold block">Or Quick 1-Click Demo Login</span>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleDemoSelect('customer')}
            className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white hover:text-yellow-400 text-[11px] font-black transition active:scale-95"
          >
            🚗 Driver Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('provider')}
            className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-[11px] font-black border border-yellow-500/20 transition active:scale-95"
          >
            ⚡ Host Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('admin')}
            className="px-3 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-900 text-[11px] font-black transition active:scale-95"
          >
            🛡️ Admin Demo
          </button>
        </div>
      </div>

      {/* Role Selection Modal after register */}
      {showRoleSelection && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5 border-2 border-neutral-900 shadow-2xl animate-in fade-in">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-neutral-900">Choose Primary Role</h3>
              <p className="text-xs text-neutral-500">You can switch roles anytime from your profile.</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setRegisteredRole('customer')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                  registeredRole === 'customer'
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-black text-yellow-400 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs text-neutral-900">Driver / EV Owner</div>
                  <div className="text-[11px] text-neutral-500">Book parking slots and fast chargers</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRegisteredRole('provider')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                  registeredRole === 'provider'
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs text-neutral-900">Host / Property Owner</div>
                  <div className="text-[11px] text-neutral-500">Monetize parking bays and EV chargers</div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={handleRoleConfirm}
              disabled={isLoading}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition"
            >
              Continue to VFlow
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 border-2 border-neutral-900 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-neutral-900">Reset Your Password</h3>
              <p className="text-xs text-neutral-500 mt-0.5">We'll send password recovery steps to your email.</p>
            </div>

            {forgotMessage && (
              <div className="p-3 bg-neutral-100 rounded-xl text-xs font-bold text-neutral-800">
                {forgotMessage}
              </div>
            )}

            {!forgotSubmitted ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 font-semibold focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-yellow-400 text-black font-black text-xs rounded-xl shadow-xs transition"
                >
                  Send Reset Link
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-3 bg-black text-yellow-400 font-black text-xs rounded-xl"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
