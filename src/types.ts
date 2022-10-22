import React, { PropsWithChildren } from 'react';
import { RESET_ACTIONS } from './constants';

type ValueOf<T> = T[keyof T];

export type Key = string | symbol
export type FormData = Record<Key, any>

export type ResetAction = ValueOf<typeof RESET_ACTIONS>;

export type AnyFn<T extends any[]> = (...args: [...T, ...any]) => any;
export type AnyFormDataFn = AnyFn<[FormData]>;

export interface FormContextProps {
  errors: FormData;
  hasErrors: boolean;

  formData: FormData;
  isFormDirty: boolean;

  clearForm: AnyFn<[any]>;
  handleSubmit: (onSubmit: AnyFormDataFn, onError?: AnyFormDataFn) => void;
}

export interface InternalFormContextProps {
  resetAction?: ResetAction;
  validateRequired?: boolean;

  updateForm: (key: Key, payload?: any) => void;
  setFormError: (key: Key, payload?: any) => void;

  setRequiredField: (key: Key, required?: boolean, requiredErrorMessage?: any) => void;
  getPristineValue: (key: Key, defaultValue?: any) => any;
}

export interface ProviderComponent extends React.FC<PropsWithChildren<{}>> {
  internalFormContext: InternalFormContextProps;
  formContext: FormContextProps
}
