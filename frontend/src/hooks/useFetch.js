import { useState, useEffect } from 'react';

const useFetch = (fetcher, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((response) => {
        if (mounted) {
          setData(response.data);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.response?.data?.message || err.message);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error };
};

export default useFetch;
