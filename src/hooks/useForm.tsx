import React, { useRef, useState, useCallback, PropsWithChildren, useMemo } from 'react'

import { isEmpty } from '../utils';

import InternalFormContext from '../contexts/InternalFormContext'
import FormContext from '../contexts/FormContext'

import useLazyEffect from './useLazyEffect'
import usePersistentCallback from './usePersistentCallback';

import {
  FormContextProps, FormData,
  InternalFormContextProps,
  Key, ProviderComponent
} from '../types';

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

type FormOptions = {
  formData: FormData,
  onErrorChange?: (errorMeta: { hasErrors: boolean, errors: FormData }, ) => any,
  onFormChange?: (formMeta: { isDirty: boolean, formData: FormData }) => any
}

const useForm = (
  {
    formData: data,
    onErrorChange = any => any,
    onFormChange = any => any,
  }: FormOptions
) => {
  const [resetFields, setResetFields] = useState({})
  const [resetErrors, setResetErrors] = useState({})

  const iFormData = useRef<FormData>(data)
  const formData = useRef<FormData>(data);

  const updateForm: InternalFormContextProps['updateForm'] =
    useCallback((key, payload) => {
      formData.current = { ...formData.current, [key]: payload };
      onFormChange({ formData: formData.current, isDirty: true })
    }, [onFormChange])

  const markFormPristine = useCallback((keepChanges: boolean) => {
    if (!keepChanges) {
      formData.current = iFormData.current;
    } else {
      iFormData.current = formData.current;
    }

    setResetFields({})
    onFormChange({ formData: formData.current, isDirty: false})
  }, [onFormChange])

  const validateRequired = useRef(false);
  const requiredFields = useRef<Map<Key, any>>(new Map())
  const errors = useRef<FormData>({});

  const setFormError: InternalFormContextProps['setFormError'] =
    useCallback((key, payload) => {
      let didChange = false
      if (payload && payload !== errors.current[key]) {
        didChange = true;
        errors.current[key] = payload;
      }

      if (!payload && Object.prototype.hasOwnProperty.call(errors.current, key)) {
        didChange = true;
        delete errors.current[key];
      }

      if (didChange) {
        onErrorChange({
          errors: { ...errors.current },
          hasErrors: Object.keys(errors.current).length > 0
        });
      }
    }, [onErrorChange])

  const isFormValid = useCallback(() => {
    if (Object.keys(errors.current).length > 0) return false;

    if (!validateRequired.current) {
      let missingRequiredFields = false;
      validateRequired.current = true;

      requiredFields.current.forEach((errorMessage, key) => {
        if (isEmpty(formData.current[key])) {
          missingRequiredFields = true;
          errors.current = { ...errors.current, [key]: errorMessage };
        }
      });

      return !missingRequiredFields
    }

    return true;
  }, [])

  const handleSubmit: FormContextProps['handleSubmit'] =
    usePersistentCallback(async (onSubmit, onError) => {
      const oldErrors = errors.current;

      if (isFormValid()) {
        const isSuccessful = await onSubmit(formData.current);
        if (isSuccessful !== false) markFormPristine(true);
        return;
      }

      if (oldErrors !== errors.current) {
        setResetErrors({})
        onErrorChange({ errors: errors.current, hasErrors: true })
      }

      onError && onError(errors.current)
  })

  const clearForm: FormContextProps['clearForm'] =
    usePersistentCallback(() => {
      markFormPristine(false);
    })

  const getPristineValue: InternalFormContextProps['getPristineValue'] =
    useCallback((key, defaultValue) => {
      if (Object.prototype.hasOwnProperty.call(iFormData.current, key)) {
        return iFormData.current[key]
      }

      return defaultValue
    }, [])

  const getFieldError: InternalFormContextProps['getFieldError'] =
    useCallback((key) => errors.current[key], [])

  const setRequiredField: InternalFormContextProps['setRequiredField'] =
    useCallback((key, required, requiredErrorMessage) => {
      if (required) {
        requiredFields.current.set(key, requiredErrorMessage)
      } else {
        requiredFields.current.delete(key)
      }
    }, [])

  useLazyEffect(() => {
    iFormData.current = data
    markFormPristine(false)
  }, [data])

  const internalContext = useMemo(() => ({
    resetFields, resetErrors, validateRequired,
    getFieldError, getPristineValue,
    updateForm, setFormError, setRequiredField
  }), [
    resetFields, resetErrors,
    getFieldError, getPristineValue,
    updateForm, setFormError, setRequiredField
  ])

  const formContext = useMemo(() => ({
    handleSubmit, clearForm
  }), [handleSubmit, clearForm])

  const FormProvider = useFormProvider(internalContext, formContext);

  return {
    ...formContext,
    FormProvider
  }
}

export default useForm;
