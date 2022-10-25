import { useMemo, useRef } from "react"

const useDidChange = (deps: Array<any>) => {
  const counter1 = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const counter2 = useMemo(() => counter1.current + 1, deps);

  if (counter2 - counter1.current) {
    counter1.current += 1;
    return true;
  }

  return false
}

export default useDidChange;
