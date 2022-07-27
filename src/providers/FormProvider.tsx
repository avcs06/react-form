import React, { useRef, useState, useCallback, PropsWithChildren, useMemo } from 'react'

import { RESET_ACTIONS } from '../constants'
import { isEmpty } from '../utils';

import InternalFormContext from '../contexts/InternalFormContext'
import FormContext from '../contexts/FormContext'

import useSomeEffect from '../hooks/useSomeEffect'
import useLazyEffect from '../hooks/useLazyEffect'
import useDirty from '../hooks/useDirty'

import type { FormContextProps, FormData, ResetAction, InternalFormContextProps, Key } from '../types'

export const FormProvider = ({ data, children }: PropsWithChildren<{ data: FormData }>) => {
  const [errors, setErrors] = useState<Object>({})
  const [resetAction, setResetAction] = useState<ResetAction>()

  const [validateRequired, setValidateRequired] = useState<boolean>(false)
  const requiredFields = useRef<Set<Key>>(new Set())

  const [formData, setFormData, isFormDirty, iFormData] = useDirty<FormData>(data, resetAction)
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

  const updateForm: FormContextProps['updateForm'] = useCallback((key, payload) => {
    setFormData(currentData => ({ ...currentData, [key]: payload }))
  }, [])

  const setFormError: FormContextProps['setFormError'] = useCallback((key, payload) => {
    setErrors(currentData => {
      const newData = { ...currentData };
      if (payload) newData[key] = payload;
      else delete newData[key];
      return newData;
    })
  }, [])

  const markFormPristine: FormContextProps['markFormPristine'] = useCallback((keepChanges) => {
    setResetAction(keepChanges ? RESET_ACTIONS.SAVE : RESET_ACTIONS.CLEAR)
  }, [])

  const getPristineValue: InternalFormContextProps['getPristineValue'] = useCallback((key, defaultValue) => {
    if (Object.prototype.hasOwnProperty.call(iFormData, key)) {
      return iFormData[key]
    }

    return defaultValue
  }, [iFormData])

  const setRequiredField: InternalFormContextProps['setRequiredField'] = useCallback((key, required) => {
    requiredFields.current[required ? 'add' : 'delete'](key)
  }, [])

  const isFormValid = useCallback(() => {
    setValidateRequired(true);
    return !hasErrors && Array.from(requiredFields.current).every(key => !isEmpty(formData[key]));
  }, [hasErrors, formData]);

  useLazyEffect(() => {
    markFormPristine()
  }, [data])

  useSomeEffect(() => {
    setResetAction(undefined)
  }, [Boolean(resetAction)])

  const internalContext = useMemo(() => ({
    resetAction, validateRequired, getPristineValue, setRequiredField
  }), [resetAction, validateRequired, getPristineValue, setRequiredField])

  const formContext = useMemo(() => ({
    formData, isFormDirty, errors, hasErrors, isFormValid, updateForm, markFormPristine, setFormError
  }), [formData, isFormDirty, errors, hasErrors, isFormValid, updateForm, markFormPristine, setFormError])

  return (
    <InternalFormContext.Provider value={internalContext}>
      <FormContext.Provider value={formContext}>
        {children}
      </FormContext.Provider>
    </InternalFormContext.Provider>
  );
};
