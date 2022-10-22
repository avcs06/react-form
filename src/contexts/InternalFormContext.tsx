import React from 'react';
import { E_OBJECT } from '../constants';

import type { InternalFormContextProps } from '../types';

const InternalFormContext = React.createContext<InternalFormContextProps>(
  E_OBJECT as InternalFormContextProps
);

export default InternalFormContext;
