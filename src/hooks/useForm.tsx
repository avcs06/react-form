import React, { PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';

import FormContext from '../contexts/FormContext';
import InternalFormContext from '../contexts/InternalFormContext';
import { isEmpty } from '../utils';
import useLazyEffect from './useLazyEffect';
import { E_ARRAY } from '../constants';

import {
  CallbackContextProps, FormContextProps,
  FormData, InternalFormContextProps, Key, ProviderComponent
} from '../types';
import CallbackContext from '../contexts/CallbackContext';

const useFormProvider = (
  internalFormContext: InternalFormContextProps,
  formContext: FormContextProps,
  callbackContext: CallbackContextProps
): ProviderComponent => {
  const Provider = useMemo<React.FC>(() => {
    const ProviderComponent = ({ children }: PropsWithChildren<{}>) => {
      const { internalFormContext, formContext, callbackContext } = (Provider as ProviderComponent);

      return (
        <CallbackContext.Provider value={callbackContext}>
          <InternalFormContext.Provider value={internalFormContext}>
            <FormContext.Provider value={formContext}>
              {children}
            </FormContext.Provider>
          </InternalFormContext.Provider>
        </CallbackContext.Provider>
      )
    }

    return ProviderComponent;
  }, []);

  (Provider as ProviderComponent).internalFormContext = internalFormContext;
  (Provider as ProviderComponent).formContext = formContext;
  (Provider as ProviderComponent).callbackContext = callbackContext;
  return (Provider as ProviderComponent)
}

type FormOptions = {
  formData: FormData,
}

const useForm = (
  {
    formData: data
  }: FormOptions
) => {
  const callbacks = useRef<CallbackContextProps>({
    errorCallbacks: new Set(),
    formCallbacks: new Set()
  })

  const { errorCallbacks, formCallbacks } = callbacks.current

  const [resetFields, setResetFields] = useState({})
  const [resetErrors, setResetErrors] = useState({})

  const iFormData = useRef<FormData>(data)
  const formData = useRef<FormData>(data)

  const updateForm: InternalFormContextProps['updateForm'] =
    useCallback((key, payload) => {
      formData.current = { ...formData.current, [key]: payload };
      formCallbacks.forEach((formCallback) => {
        formCallback({ formData: formData.current, isDirty: true })
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, E_ARRAY)

  const markFormPristine = useCallback((keepChanges: boolean) => {
    if (!keepChanges) {
      formData.current = iFormData.current;
    } else {
      iFormData.current = formData.current;
    }

    setResetFields({})
    formCallbacks.forEach((formCallback) => {
      formCallback({ formData: formData.current, isDirty: false})
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, E_ARRAY)

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
        errorCallbacks.forEach(errorCallback => {
          errorCallback({
            errors: { ...errors.current },
            hasErrors: Object.keys(errors.current).length > 0
          })
        })
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, E_ARRAY)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, E_ARRAY)

  const handleSubmit: FormContextProps['handleSubmit'] = useCallback((onSubmit, onError) => {
    const oldErrors = errors.current;

    if (isFormValid()) {
      Promise.resolve(onSubmit(formData.current)).then(isSuccessful => {
        if (isSuccessful !== false) markFormPristine(true);
      });
      return;
    }

    if (oldErrors !== errors.current) {
      setResetErrors({})
      errorCallbacks.forEach(errorCallback => {
        errorCallback({ errors: errors.current, hasErrors: true })
      })
    }

    onError && onError(errors.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, E_ARRAY)

  const clearForm: FormContextProps['clearForm'] = useCallback(() => {
    markFormPristine(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, E_ARRAY)

  const getPristineValue: InternalFormContextProps['getPristineValue'] = useCallback((key, defaultValue) => {
    if (Object.prototype.hasOwnProperty.call(iFormData.current, key)) {
      return iFormData.current[key]
    }

    return defaultValue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, E_ARRAY)

  const getFieldError: InternalFormContextProps['getFieldError'] =
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback((key) => errors.current[key], E_ARRAY)

  const setRequiredField: InternalFormContextProps['setRequiredField'] =
    useCallback((key, required, requiredErrorMessage) => {
      if (required) {
        requiredFields.current.set(key, requiredErrorMessage)
      } else {
        requiredFields.current.delete(key)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, E_ARRAY)

  useLazyEffect(() => {
    iFormData.current = data
    markFormPristine(false)
  }, [data])

  const internalContext = useMemo(() => ({
    resetFields, resetErrors, validateRequired,
    getFieldError, getPristineValue,
    updateForm, setFormError, setRequiredField
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [resetFields, resetErrors])

  const formContext = useMemo(() => ({
    handleSubmit, clearForm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), E_ARRAY)

  const FormProvider = useFormProvider(internalContext, formContext, callbacks.current);

  return {
    ...formContext,
    FormProvider
  }
}

export default useForm;
