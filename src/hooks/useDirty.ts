import React, { useState, useRef } from 'react';

import { RESET_ACTIONS } from '../constants';
import useLazyEffect from './useLazyEffect';

import type { ResetAction } from '../types';

type useDirtyReturn<T> = [T, React.Dispatch<React.SetStateAction<T>>, boolean, T];

const useDirty = <T>(initialData: T, resetAction?: ResetAction): useDirtyReturn<T> => {
  const initialDataRef = useRef<T>(initialData);
  const [data, setData] = useState<T>(initialData);
  const isDirty = data !== initialDataRef.current;

  useLazyEffect(() => {
    initialDataRef.current = initialData;
    setData(initialData);
  }, [initialData]);

  useLazyEffect(() => {
    switch (resetAction) {
      case RESET_ACTIONS.CLEAR:
        setData(initialDataRef.current);
        break;
      case RESET_ACTIONS.SAVE:
        initialDataRef.current = data;
        break;
      default:
      // no default
    }
  }, [resetAction]);

  return [data, setData, isDirty, initialDataRef.current];
};

export default useDirty;
