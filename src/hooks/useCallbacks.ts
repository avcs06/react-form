import { useContext, useEffect, useMemo, useRef } from 'react';

import { CallbackContextProps, ErrorCallback, FormCallback, ProviderComponent } from '../types';
import { register } from '../utils';
import { E_ARRAY, E_OBJECT } from '../constants';
import CallbackContext from '../contexts/CallbackContext';

const useWatch = <T = ErrorCallback | FormCallback>(callbackSet: Set<T>, callback:T) => {
  const lastUnregister = useRef<() => void>()

  useMemo(() => {
    lastUnregister.current?.()
    lastUnregister.current = register(callbackSet, callback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback])

  useEffect(() => {
    return () => lastUnregister.current?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, E_ARRAY)
}

const makeWatchHook = <T>(key: keyof CallbackContextProps) => {
  return (callback: T, { FormProvider }: { FormProvider: ProviderComponent }) => {
    let callbackContext = useContext(CallbackContext);
    if (FormProvider) {
      callbackContext = FormProvider.callbackContext
    } else if (callbackContext === E_OBJECT) {
      throw new Error(
        'useFormState should either be wrapped inside a FormProvider ' +
        'or should be called with provider in options'
      )
    }

    useWatch<T>(callbackContext[key] as Set<T>, callback)
  }
}

export const useFormWatch = makeWatchHook('formCallbacks')
export const useErrorWatch = makeWatchHook('errorCallbacks')
