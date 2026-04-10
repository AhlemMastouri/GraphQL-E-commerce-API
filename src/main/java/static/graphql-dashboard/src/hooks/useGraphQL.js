import { useState, useEffect, useCallback } from 'react';
import { gqlRequest } from '../graphql/client';

export function useQuery(query, variables = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const key = JSON.stringify(variables);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await gqlRequest(query, variables);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [query, key]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

export function useMutation(query) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = async (variables = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await gqlRequest(query, variables);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
