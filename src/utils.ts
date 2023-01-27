import { ErrorCallback, FormCallback } from './types';
export const isEmpty = (val: any): boolean => !val && val !== 0


export const register = <T = ErrorCallback | FormCallback>(callbackSet: Set<T>, callback: T): (() => void) => {
  callbackSet.add(callback);

  return () => {
    callbackSet.delete(callback)
  }
}
