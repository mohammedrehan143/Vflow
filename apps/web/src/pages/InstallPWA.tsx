import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share,
  PlusSquare,
  Monitor,
  Zap,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';

import { usePWA } from '../context/PWAContext';

export const InstallPWA: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isStandalone,
    promptInstall,
    isIOS,
  } = usePWA();

  const handleInstallClick = async () => {
    if (isInstallable) {
      await promptInstall();
    } else {
      // Scroll down to instructions section
      const el = document.getElementById('instructions-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/20">
          <Zap className="w-8 h-8 fill-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Install VFlow on Your Device
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Access instant parking reservations, EV charger directions, and host earnings directly from your home screen with zero app-store download bloat.
        </p>

        <div className="pt-2">
          {isInstalled ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-full font-bold text-xs border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>VFlow App is Installed & Active</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition text-sm inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Install VFlow Web App Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-5 h-5 fill-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Instant Launch Speed</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Opens instantaneously without browser address bars for a full-screen native mobile application experience.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <WifiOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Offline Fallback Screen</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Essential static assets are securely cached so the interface remains reliable even in basement parking lots with weak mobile signal.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Secure Storage</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No dangerous private financial tokens or card details are ever stored locally, complying strictly with PCI-DSS & VFlow security policy.
          </p>
        </div>
      </div>

      {/* Step-by-Step Installation Instructions by Device (Section 16) */}
      <div id="instructions-section" className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Installation Instructions by Browser</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Android */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Android (Google Chrome)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
              <li>Open <strong>VFlow</strong> in Chrome.</li>
              <li>Tap the three vertical dots (<strong>⋮</strong>) in the top-right corner.</li>
              <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
              <li>Confirm and find VFlow on your launcher.</li>
            </ol>
          </div>

          {/* iOS / Safari */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Share className="w-4 h-4 text-emerald-600" />
              <span>iPhone & iPad (Safari)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
              <li>Open <strong>VFlow</strong> in Safari.</li>
              <li>Tap the <strong>Share</strong> button (box with an upward arrow) in the toolbar.</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top right.</li>
            </ol>
          </div>

          {/* Desktop Chrome / Edge */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Monitor className="w-4 h-4 text-emerald-600" />
              <span>Desktop (Chrome / Edge)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
              <li>Look at the right side of the address bar.</li>
              <li>Click the <strong>Install VFlow</strong> icon (computer with down arrow).</li>
              <li>Click <strong>Install</strong> to launch as a standalone desktop app.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
