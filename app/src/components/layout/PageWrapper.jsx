import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageWrapper({ children }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [location.pathname]);

  return (
    <div
      className={`transition-all duration-300 ease-out pb-20 md:pb-0 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[6px]'
      }`}
    >
      {children}
    </div>
  );
}
