import  { useContext } from 'react';

import FormContext from '../contexts/FormContext';
import { FormContextProps } from '../types';

const useFormContext = (): FormContextProps => {
  return useContext(FormContext);
};

export default useFormContext;
