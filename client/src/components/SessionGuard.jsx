import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SessionGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');
    const now = Date.now();

    if (!token || now > Number(expiry)) {
      navigate('/login');
    }
  }, [navigate]);

  return children;
}