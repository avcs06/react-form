import { useEffect, useRef } from 'react';

const useLazyEffect = (callback: Function, deps: Array<any>) => {
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    } else callback();
  }, deps);
};

export default useLazyEffect;
