import { useCallback, useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface AsyncData<T> extends AsyncDataState<T> {
  reload: () => void;
  setData: (data: T) => void;
}

/**
 * Runs `fetcher` whenever `deps` change and exposes a loading / error / data
 * tuple together with a manual `reload` and `setData`. A monotonic version ref
 * makes sure stale responses cannot overwrite fresher state when `deps`
 * change rapidly.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
): AsyncData<T> {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const versionRef = useRef(0);

  const reload = useCallback(() => {
    const version = ++versionRef.current;
    setState((prev) => ({ data: prev.data, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (version === versionRef.current) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err: Error) => {
        if (version === versionRef.current) {
          setState((prev) => ({ data: prev.data, loading: false, error: err.message }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  const setData = useCallback((data: T) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return { ...state, reload, setData };
}
