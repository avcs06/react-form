import React, { useEffect, useContext, useMemo, useState, useCallback } from 'react';
import { isEmpty } from '../utils';

import InternalFormContext from '../contexts/InternalFormContext';
import useSomeEffect from './useSomeEffect';
import useDirty from './useDirty';

import { E_OBJECT } from '../constants';
import FormContext from '../contexts/FormContext';
import { ProviderComponent, Key } from '../types';

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
  let formContext = useContext(FormContext);
  if (provider) {
    formContext = provider.formContext;
    internalContext = provider.internalFormContext
  } else if (internalContext === E_OBJECT) {
    throw new Error(
      'useFormState should either be wrapped inside a FormProvider ' +
      'or should be called with provider in options'
    )
  }

  const {
    resetAction, getPristineValue, validateRequired,
    setRequiredField, updateForm,  setFormError
  } = internalContext;

  const { errors } = formContext

  const initialData = useMemo(() => (
    { value: getPristineValue(key, defaultValue) }
  ), [getPristineValue, key, defaultValue]);

  const [data, setData, isDirty] = useDirty(initialData, resetAction);
  const [localError, setLocalError] = useState<any>(undefined)
  const error = useMemo(() => localError || errors[key], [errors[key], localError])

  const oData: T = useMemo(() => data.value, [data]);
  const setOData = useCallback((val: T) => {
    if (typeof val === 'function')
      setData(({ value }) => ({ value: val(value) }))
    else
      setData({ value: val })
  }, [])

  useEffect(() => {
    setRequiredField(key, required, requiredErrorMessage)
  }, [required, requiredErrorMessage])

  useSomeEffect(() => {
    let errorMessage;
    if (validateRequired && isEmpty(oData)) {
      errorMessage = requiredErrorMessage;
    } else {
      errorMessage = validate(oData) || undefined;
    }

    setLocalError(errorMessage)
    setFormError(key, errorMessage)
    updateForm(key, oData)
  }, [isDirty && data])

  return [oData, setOData, isDirty, error];
};

export default useFormState;
