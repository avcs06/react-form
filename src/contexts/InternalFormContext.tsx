import React from 'react';

import type { InternalFormContextProps } from '../types';

const InternalFormContext = React.createContext<InternalFormContextProps>({} as InternalFormContextProps);

export default InternalFormContext;
