import  { useContext } from 'react';

import FormContext from '../contexts/FormContext';
import type { FormContextProps } from '../types';

const useFormContext = (): FormContextProps => {
  return useContext(FormContext);
};

export default useFormContext;
