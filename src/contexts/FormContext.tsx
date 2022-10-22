import React from 'react';
import { E_OBJECT } from '../constants';

import type { FormContextProps } from '../types';

const FormContext = React.createContext<FormContextProps>(
  E_OBJECT as FormContextProps
);

export default FormContext;
