import { useEffect } from 'react';

const useSomeEffect = (callback: Function, deps: Array<any>) => {
  useEffect(() => {
    if (deps.reduce((a, c) => a || c !== false, false)) callback();
  }, deps);
};

export default useSomeEffect;
