import React, { useRef, useState, useCallback, PropsWithChildren, useMemo } from 'react'

import { isEmpty } from '../utils';

import InternalFormContext from '../contexts/InternalFormContext'
import FormContext from '../contexts/FormContext'

import useLazyEffect from '../hooks/useLazyEffect'
import useDirty from '../hooks/useDirty'

import {
  FormContextProps, FormData, InternalFormContextProps,
  Key, ProviderComponent, ResetAction
} from '../types'

const useFormProvider = (
  internalFormContext: InternalFormContextProps,
  formContext: FormContextProps
): ProviderComponent => {
  const Provider = useMemo<React.FC>(() => {
    const ProviderComponent = ({ children }: PropsWithChildren<{}>) => {
      const { internalFormContext, formContext } = (Provider as ProviderComponent);

      return (
        <InternalFormContext.Provider value={internalFormContext}>
          <FormContext.Provider value={formContext}>
            {children}
          </FormContext.Provider>
        </InternalFormContext.Provider>
      )
    }

    return ProviderComponent;
  }, []);

  (Provider as ProviderComponent).internalFormContext = internalFormContext;
  (Provider as ProviderComponent).formContext = formContext;
  return (Provider as ProviderComponent)
}

const useForm = (data: FormData) => {
  const [errors, setErrors] = useState<FormData>({})
  const [resetAction, setResetAction] = useState<InternalFormContextProps['resetAction']>({})

  const [validateRequired, setValidateRequired] = useState<boolean>(false)
  const requiredFields = useRef<Map<Key, any>>(new Map())

  const iFormData = useRef(data)
  iFormData.current = data

  const [formData, setFormData, isFormDirty] = useDirty<FormData>(data, resetAction)
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

  const updateForm: InternalFormContextProps['updateForm'] =
    useCallback((key, payload) => {
      setFormData(currentData => ({ ...currentData, [key]: payload }))
    }, [])

  const setFormError: InternalFormContextProps['setFormError'] =
    useCallback((key, payload) => {
      setErrors(currentData => {
        const newData = { ...currentData };
        if (payload) newData[key] = payload;
        else delete newData[key];
        return newData;
      })
    }, [])

  const markFormPristine = useCallback((keepChanges: boolean) => {
    setResetAction({ type: keepChanges ? ResetAction.SAVE : ResetAction.CLEAR })
  }, [])

  const isFormValid = useCallback(() => {
    if (hasErrors) return errors;

    if (!validateRequired) {
      const errs = { ...errors };
      let missingRequiredFields = false;

      setValidateRequired(true);
      requiredFields.current.forEach((errorMessage, key) => {
        if (isEmpty(formData[key])) {
          missingRequiredFields = true;
          setFormError(key, errorMessage)
          errs[key] = errorMessage
        }
      });

      return !missingRequiredFields || errs
    }

    return true;
  }, [errors, validateRequired, hasErrors, formData])

  const handleSubmit: FormContextProps['handleSubmit'] =
    useCallback((onSubmit, onError) => {
      const validity = isFormValid() as (boolean | FormData);
      if (validity === true) {
        markFormPristine(true);
        onSubmit(formData);
      } else if (onError && validity) {
        onError(validity)
      }
    }, [isFormValid, formData])

  const clearForm: FormContextProps['clearForm'] =
    useCallback(() => {
      markFormPristine(false);
    }, [])

  const getPristineValue: InternalFormContextProps['getPristineValue'] =
    useCallback((key, defaultValue) => {
      if (Object.prototype.hasOwnProperty.call(iFormData.current, key)) {
        return iFormData.current[key]
      }

      return defaultValue
    }, [])

  const setRequiredField: InternalFormContextProps['setRequiredField'] =
    useCallback((key, required, requiredErrorMessage) => {
      if (required) {
        requiredFields.current.set(key, requiredErrorMessage)
      } else {
        requiredFields.current.delete(key)
      }
    }, [])

  useLazyEffect(() => {
    markFormPristine(false)
  }, [data])

  const internalContext = useMemo(() => ({
    resetAction, validateRequired, updateForm, setFormError, getPristineValue, setRequiredField
  }), [resetAction, validateRequired, updateForm, setFormError,getPristineValue, setRequiredField])

  const formContext = useMemo(() => ({
    formData, isFormDirty, errors, hasErrors, handleSubmit, clearForm
  }), [formData, isFormDirty, errors, hasErrors, handleSubmit, clearForm])

  const FormProvider = useFormProvider(internalContext, formContext);

  return {
    ...formContext,
    FormProvider
  }
}

export default useForm;
