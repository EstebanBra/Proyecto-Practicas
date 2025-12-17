import { useEffect, useState, useCallback } from 'react';
import { getOfertas } from '@services/ofertaPractica.service.js';

export default function useGetOfertas() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOfertas();
      // backend returns [ofertas, null] according to controller
      const items = Array.isArray(data) && data.length > 0 && data[0] !== undefined ? data[0] : data;
      setOfertas(items || []);
    } catch (err) {
      setError(err?.response?.data || err.message || 'Error fetching ofertas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ofertas, loading, error, reload: fetch };
}
