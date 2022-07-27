import { RESET_ACTIONS } from './constants';

type ValueOf<T> = T[keyof T];

export type Key = string | symbol

export type ResetAction = ValueOf<typeof RESET_ACTIONS>;

export interface FormData {
  [key: Key]: any
}

export interface FormContextProps {
  errors: FormData;
  hasErrors: boolean;
  isFormValid: () => boolean;
  setFormError: (key: Key, payload?: any) => void;

  formData: FormData;
  isFormDirty: boolean;
  updateForm: (key: Key, payload?: any) => void;
  markFormPristine: (keepChanges?: boolean) => void;
}

export interface InternalFormContextProps {
  resetAction?: ResetAction;
  validateRequired?: boolean;
  setRequiredField: (key: Key, required?: boolean) => any;
  getPristineValue: (key: Key, defaultValue?: any) => any;
}
