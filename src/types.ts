/* eslint-disable no-unused-vars */
import React, { PropsWithChildren } from 'react';

export enum ResetAction {
  CLEAR = 'clear',
  SAVE = 'save'
};

export type Key = string | symbol
export type FormData = Record<Key, any>


export type AnyFn<T extends any[]> = (...args: [...T, ...any]) => any;
export type AnyFormDataFn = AnyFn<[FormData]>;

export interface FormContextProps {
  clearForm: AnyFn<[any]>;
  handleSubmit: (onSubmit: AnyFormDataFn, onError?: AnyFormDataFn) => void;
}

export interface InternalFormContextProps {
  resetFields: {};
  resetErrors: {};
  validateRequired: React.MutableRefObject<boolean>;

  updateForm: (key: Key, payload?: any) => void;
  setFormError: (key: Key, payload?: any) => void;
  setRequiredField: (key: Key, required?: boolean, requiredErrorMessage?: any) => void;

  getPristineValue: (key: Key, defaultValue?: any) => any;
  getFieldError: (key: Key) => any;
}

export type AnyFunction = (...args: any[]) => any

export type ErrorCallback = (errorMeta: { hasErrors: boolean, errors: FormData }) => any
export type FormCallback = (formMeta: { isDirty: boolean, formData: FormData }) => any

export interface CallbackContextProps {
  errorCallbacks: Set<ErrorCallback>;
  formCallbacks: Set<FormCallback>
}

export interface ProviderComponent extends React.FC<PropsWithChildren<{}>> {
  internalFormContext: InternalFormContextProps;
  formContext: FormContextProps;
  callbackContext: CallbackContextProps;
}
