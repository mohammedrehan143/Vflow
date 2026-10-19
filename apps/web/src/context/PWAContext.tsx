import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Early capture before React renders
let earlyDeferredPrompt: any = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    earlyDeferredPrompt = e;
    window.dispatchEvent(new CustomEvent('vflow-pwa-prompt-available', { detail: e }));
  });
}

export interface PWAContextType {
  deferredPrompt: any;
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isSafari: boolean;
  isDismissed: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unsupported'>;
  dismissPrompt: () => void;
  showFallbackModal: boolean;
  setShowFallbackModal: (show: boolean) => void;
  openInstallFlow: () => Promise<'accepted' | 'dismissed' | 'unsupported'>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(earlyDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const recorded = localStorage.getItem('vflow_pwa_installed') === 'true';
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    return recorded || standalone;
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('vflow_pwa_dismissed') === 'true';
  });

  const [showFallbackModal, setShowFallbackModal] = useState<boolean>(false);

  // Device detection
  const isIOS = typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

  const isSafari = typeof navigator !== 'undefined' &&
    (/Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(navigator.userAgent));

  useEffect(() => {
    // 1. Listen for custom event or late beforeinstallprompt
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleCustomPrompt = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail);
      }
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('vflow-pwa-prompt-available', handleCustomPrompt);

    // 2. Listen for appinstalled
    const handleAppInstalled = () => {
      console.log('[PWA] VFlow application was successfully installed.');
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem('vflow_pwa_installed', 'true');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Listen for display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsStandalone(true);
        setIsInstalled(true);
        localStorage.setItem('vflow_pwa_installed', 'true');
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('vflow-pwa-prompt-available', handleCustomPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    sessionStorage.setItem('vflow_pwa_dismissed', 'true');
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    const prompt = deferredPrompt || earlyDeferredPrompt;
    if (!prompt) {
      return 'unsupported';
    }

    try {
      await prompt.prompt();
      const choiceResult = await prompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('vflow_pwa_installed', 'true');
        setDeferredPrompt(null);
        earlyDeferredPrompt = null;
        return 'accepted';
      } else {
        // User dismissed native prompt
        dismissPrompt();
        return 'dismissed';
      }
    } catch (err) {
      console.error('[PWA] Error displaying install prompt:', err);
      return 'unsupported';
    }
  }, [deferredPrompt, dismissPrompt]);

  const openInstallFlow = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    return await promptInstall();
  }, [promptInstall]);

  const isInstallable = !!deferredPrompt && !isInstalled && !isStandalone;

  return (
    <PWAContext.Provider
      value={{
        deferredPrompt,
        isInstallable,
        isInstalled,
        isStandalone,
        isIOS,
        isSafari,
        isDismissed,
        promptInstall,
        dismissPrompt,
        showFallbackModal,
        setShowFallbackModal,
        openInstallFlow,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
