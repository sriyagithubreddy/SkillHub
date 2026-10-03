import { useEffect, useState } from 'react';

export default function OnlineStatusPill() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return <div className={`status-pill ${online ? '' : 'offline'}`}>{online ? 'Online' : 'Offline Mode'}</div>;
}
