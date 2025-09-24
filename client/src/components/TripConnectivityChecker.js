export const isOnline = () => navigator.onLine;

window.addEventListener('online', () => console.log('✅ Back online'));
window.addEventListener('offline', () => console.log('⚠️ Offline mode'));