// mobile/PWAInstaller.tsx
import React, { useEffect, useState, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
};

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [supported, setSupported] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      const ev = e as BeforeInstallPromptEvent;
      // Prevent the mini-infobar from appearing on mobile
      ev.preventDefault();
      setDeferredPrompt(ev);
      setSupported(true);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    // Feature-detect fallback: if browser doesn't fire beforeinstallprompt,
    // it may still support PWA install UI via browser chrome.
    setSupported('BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      setPending(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('PWA installation accepted');
        setInstalled(true);
      } else {
        console.log('PWA installation dismissed');
      }
    } catch (err) {
      console.error('PWA install failed', err);
    } finally {
      setPending(false);
      // Clear stored prompt — spec advises discarding it after prompt()
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (!supported) {
    return null; // render nothing if install flow not supported
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={!deferredPrompt || installed || pending}
      aria-disabled={!deferredPrompt || installed || pending}
      aria-pressed={installed}
      title={installed ? 'App installed' : !deferredPrompt ? 'Install not available yet' : 'Install FleetTrack XII'}
      className="px-3 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
    >
      {installed ? 'Installed' : pending ? 'Installing...' : 'Install FleetTrack XII'}
    </button>
  );
};

export default PWAInstaller;