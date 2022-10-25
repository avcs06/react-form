import { useMemo, useRef } from "react"
import { AnyFunction } from '../types';

const usePersistentCallback = (callback: AnyFunction):AnyFunction => {
  const persistentCallback = useRef(callback);
  persistentCallback.current = callback;

  return useMemo(() => (...args) => {
    return persistentCallback.current(...args)
  }, []);
}

export default usePersistentCallback
