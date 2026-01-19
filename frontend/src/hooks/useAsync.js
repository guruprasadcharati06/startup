import { useCallback, useEffect, useState } from 'react';

// Generic async hook with loading and error states
const useAsync = (asyncFn, immediate = true) => {
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await asyncFn(...args);
        setValue(response);
        return response;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, loading, error, value, setValue };
};

export default useAsync;
