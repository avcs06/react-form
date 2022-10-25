import React, { useEffect, useContext, useMemo, useCallback } from 'react';
import { isEmpty } from '../utils';

import InternalFormContext from '../contexts/InternalFormContext';
import useSomeEffect from './useSomeEffect';
import useDirty from './useDirty';

import { E_OBJECT } from '../constants';
import { ProviderComponent, Key } from '../types';
import useDidChange from './useDidChange';
import useLazyEffect from './useLazyEffect';

interface FormStateOptions {
  defaultValue?: any;
  validate?: (value: any) => any;
  required?: boolean;
  requiredErrorMessage?: any;
  provider?: ProviderComponent
}

const useFormState = <T>(
  key: Key,
  {
    defaultValue = undefined,
    validate = () => undefined,
    required = false,
    requiredErrorMessage,
    provider
  }: FormStateOptions  = {}
): [T, React.Dispatch<React.SetStateAction<T>>, boolean, any] => {
  let internalContext = useContext(InternalFormContext);
  if (provider) {
    internalContext = provider.internalFormContext
  } else if (internalContext === E_OBJECT) {
    throw new Error(
      'useFormState should either be wrapped inside a FormProvider ' +
      'or should be called with provider in options'
    )
  }

  const {
    resetFields, resetErrors, getPristineValue, validateRequired,
    setRequiredField, updateForm,  setFormError, getFieldError
  } = internalContext;

  const initialValue = getPristineValue(key, defaultValue);
  const initialData = useMemo(() => ({ value: initialValue }), [initialValue]);
  const [data, setData, isDirty] = useDirty(initialData, resetFields);

  const oData: T = data.value;
  const setOData =
    useCallback<React.Dispatch<React.SetStateAction<T>>>((val) => {
      if (typeof val === 'function')
        setData(({ value }) => ({
          value: (val as (prevState: T) => T)(value)
        }))
      else
        setData({ value: val })
    }, [setData])

  const formError = getFieldError(key);
  const resetErrorsChanged = useDidChange([resetErrors]);
  const localError = useMemo(() => {
    if (validateRequired.current && isEmpty(oData)) {
      return requiredErrorMessage;
    }
    return validate(oData) || undefined;
  }, [oData, requiredErrorMessage, validate, validateRequired])

  useEffect(() => {
    setRequiredField(key, required, requiredErrorMessage)
  }, [key, required, requiredErrorMessage, setRequiredField])

  useSomeEffect(() => {
    updateForm(key, oData)
  }, [isDirty && data])

  useLazyEffect(() => {
    setFormError(key, localError)
  }, [localError])

  return [oData, setOData, isDirty, resetErrorsChanged ? formError : localError];
};

export default useFormState;
