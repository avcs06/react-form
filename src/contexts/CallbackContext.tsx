import React from 'react';
import { E_OBJECT } from '../constants';

import { CallbackContextProps } from '../types';

const CallbackContext = React.createContext<CallbackContextProps>(
  E_OBJECT as CallbackContextProps
);

export default CallbackContext;
