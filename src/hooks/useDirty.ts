import React, { useState, useRef, useMemo } from 'react';

import { InternalFormContextProps } from '../types';
import useDidChange from './useDidChange';
import usePersistentCallback from './usePersistentCallback';

type useDirtyReturn<T> = [T, React.Dispatch<React.SetStateAction<T>>, boolean];

const useDirty = <T>(
  initialData: T,
  resetFields: InternalFormContextProps['resetFields']
): useDirtyReturn<T> => {
  const initialDataRef = useRef<T>(initialData);
  initialDataRef.current = initialData

  const [data, setData] = useState<T>(initialData);
  const shouldResetData = useDidChange([initialData, resetFields]);

  const cData = useMemo(() => {
    return shouldResetData ? initialDataRef.current : data;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, resetFields, data])

  const setCData =
    usePersistentCallback((val) => {
      if (typeof val === 'function')
        setData((val as (prevState: T) => T)(cData))
      else
        setData(val)
    }) as React.Dispatch<React.SetStateAction<T>>

  return [cData, setCData, cData !== initialDataRef.current];
};

export default useDirty;
