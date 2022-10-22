import React, { useState, useRef, useMemo } from 'react';

import useLazyEffect from './useLazyEffect';

import { InternalFormContextProps, ResetAction } from '../types';

type useDirtyReturn<T> = [T, React.Dispatch<React.SetStateAction<T>>, boolean, T];

const useDirty = <T>(
  initialData: T,
  resetAction: InternalFormContextProps['resetAction']
): useDirtyReturn<T> => {
  const initialDataRef = useRef<T>(initialData);
  const [data, setData] = useState<T>(initialData);

  const raCounter1 = useRef(0)
  const raCounter2 = useMemo(() => raCounter1.current + 1, [resetAction])
  const isDirty = useMemo(() => {
    if (raCounter2 - raCounter1.current) {
      raCounter1.current += 1;
      return false;
    }

    return data !== initialDataRef.current
  }, [raCounter2, data]);

  useLazyEffect(() => {
    initialDataRef.current = initialData;
    setData(initialData);
  }, [initialData]);

  useLazyEffect(() => {
    switch (resetAction.type) {
      case ResetAction.CLEAR:
        setData(initialDataRef.current);
        break;
      case ResetAction.SAVE:
        initialDataRef.current = data;
        break;
      default:
      // no default
    }
  }, [resetAction]);

  return [data, setData, isDirty, initialDataRef.current];
};

export default useDirty;
