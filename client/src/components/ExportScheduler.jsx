import { useEffect } from 'react';

export default function ExportScheduler({ logs }) {
  useEffect(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const hour = now.getHours();

    if (day === 1 && hour === 8) {
      console.log('📤 Weekly export triggered');
      // Trigger export logic here
    }
  }, [logs]);

  return null;
}