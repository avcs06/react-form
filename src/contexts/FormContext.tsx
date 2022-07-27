import React from 'react';

import type { FormContextProps } from '../types';

const FormContext = React.createContext<FormContextProps>({} as FormContextProps);

export default FormContext;
