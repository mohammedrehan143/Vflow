import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePWA } from '../../context/PWAContext';
import {
  X,
  Download,
  Sparkles,
} from 'lucide-react';

export const InstallPromptPopup: React.FC = () => {
  const {
    isInstalled,
    isStandalone,
    isDismissed,
    promptInstall,
    dismissPrompt,
  } = usePWA();

  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const location = useLocation();
  const popupRef = useRef<HTMLDivElement>(null);

  // Suppress on payment and checkout routes to prevent interference with critical flows
  const isSuppressedRoute =
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/payment');

  useEffect(() => {
    // If already installed, in standalone mode, dismissed, or on a critical route, do not show
    if (isInstalled || isStandalone || isDismissed || isSuppressedRoute) {
      setIsVisible(false);
      return;
    }

    let timer: NodeJS.Timeout | null = null;
    let interactionTriggered = false;

    // Short delay before auto-showing (3.5s)
    timer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    // Or trigger after a short interaction (scroll or click) after 1.5s
    const handleInteraction = () => {
      if (!interactionTriggered) {
        interactionTriggered = true;
        setTimeout(() => {
          setIsVisible(true);
        }, 1500);
      }
    };

    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('click', handleInteraction, { once: true, passive: true });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, [isInstalled, isStandalone, isDismissed, isSuppressedRoute]);

  // Handle Escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissPrompt();
  };

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const result = await promptInstall();
      if (result === 'accepted' || result === 'dismissed') {
        setIsVisible(false);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  // Do not render if not visible, already installed, in standalone mode, dismissed, or on checkout/payment
  if (!isVisible || isInstalled || isStandalone || isDismissed || isSuppressedRoute) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-20 z-50 sm:w-[400px] max-w-[calc(100vw-2rem)] bg-neutral-950/95 backdrop-blur-md rounded-2xl shadow-2xl border border-yellow-400/40 p-5 ring-1 ring-yellow-400/20 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5 text-white"
    >
      {/* Top Header with App Branding and Close Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* VFlow App Icon */}
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 p-0.5 shadow-md shadow-yellow-400/20 flex-shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full rounded-[14px]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="100" height="100" rx="20" fill="#FACC15" />
              <path
                d="M26 28L50 74L74 28"
                stroke="#000000"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M50 20L42 42H58L50 64"
                fill="#000000"
                stroke="#FACC15"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2
                id="pwa-install-title"
                className="text-base font-black text-white tracking-tight"
              >
                Install VFlow
              </h2>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-black px-1.5 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                App
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-semibold">vflow.app</p>
          </div>
        </div>

        {/* Top-Right Close Button */}
        <button
          onClick={handleDismiss}
          aria-label="Close install prompt"
          className="text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-neutral-900 transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description Text */}
      <p
        id="pwa-install-desc"
        className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed"
      >
        Get faster access to parking, EV charging, and nearby places. Install VFlow on your device for an app-like experience.
      </p>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-end gap-2.5">
        <button
          onClick={handleDismiss}
          type="button"
          className="px-3.5 py-2 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-neutral-700"
        >
          Not Now
        </button>

        <button
          onClick={handleInstallClick}
          type="button"
          disabled={isInstalling}
          className="inline-flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black px-4 py-2 rounded-xl shadow-lg shadow-yellow-400/20 transition active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
        </button>
      </div>
    </div>
  );
};
