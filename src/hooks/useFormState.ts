import React, { useEffect, useContext, useMemo, useState, useCallback } from 'react';
import { isEmpty } from '../utils';

import InternalFormContext from '../contexts/InternalFormContext';
import useSomeEffect from './useSomeEffect';
import useDirty from './useDirty';

import type { Key } from '../types';

interface FormStateOptions {
  defaultValue?: any;
  validate?: (value: any) => any;
  required?: boolean;
  requiredErrorMessage?: any
}

const useFormState = <T>(
  key: Key,
  {
    defaultValue = undefined,
    validate = () => undefined,
    required = false,
    requiredErrorMessage
  }: FormStateOptions  = {}
): [T, React.Dispatch<React.SetStateAction<T>>, boolean, any] => {
  const {
    resetAction, getPristineValue, validateRequired,
    setRequiredField, updateForm,  setFormError
  } = useContext(InternalFormContext);

  const initialData = useMemo(() => (
    { value: getPristineValue(key, defaultValue) }
  ), [getPristineValue, key, defaultValue]);

  const [data, setData, isDirty] = useDirty(initialData, resetAction);
  const [error, setError] = useState<any>(undefined)

  const oData: T = useMemo(() => data.value, [data]);
  const setOData = useCallback((val: T) => {
    if (typeof val === 'function')
      setData(({ value }) => ({ value: val(value) }))
    else
      setData({ value: val })
  }, [])

  useEffect(() => {
    setRequiredField(key, required)
  }, [required])

  useSomeEffect(() => {
    let errorMessage;
    if (validateRequired && isEmpty(oData)) {
      errorMessage = requiredErrorMessage;
    } else {
      errorMessage = validate(oData) || undefined;
    }

    setError(errorMessage)
    setFormError(key, errorMessage)
    updateForm(key, oData)
  }, [isDirty && data])

  useSomeEffect(() => {
    let errorMessage;
    if (validateRequired && isEmpty(oData)) {
      errorMessage = requiredErrorMessage;
    }

    setError(errorMessage)
    setFormError(key, errorMessage)
  }, [validateRequired])

  return [oData, setOData, isDirty, error];
};

export default useFormState;
