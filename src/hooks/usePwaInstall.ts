import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isPromptAvailable, setIsPromptAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is launched in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing automatically on mobile
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsPromptAvailable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsPromptAvailable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsPromptAvailable(false);
          setInstallPrompt(null);
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
    } else {
      // Fallback instruction for Android Chrome if prompt isn't directly dispatchable
      alert('To install Aura Flow:\n1. Tap the three dots (⋮) in Chrome.\n2. Tap "Install App" or "Add to Home screen".');
    }
  }, [installPrompt]);

  return {
    canInstall: !isInstalled && isPromptAvailable,
    isPromptAvailable,
    isInstalled,
    triggerInstall,
  };
}
