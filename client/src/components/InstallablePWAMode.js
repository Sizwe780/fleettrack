export const enablePWAPrompt = () => {
    let deferredPrompt;
  
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Trigger UI prompt manually if needed
    });
  
    return {
      showPrompt: () => deferredPrompt?.prompt(),
      isAvailable: !!deferredPrompt,
    };
  };