import * as mobx from 'mobx';
import { Config, IStore } from './dev';

export default function getDecorator<T>(func: (store: T, storeOrConfig?: T | Config) => T) {
  return (storeOrConfig: T | Config, config?: Config) => {
    if (typeof storeOrConfig === 'object' && !mobx.isObservable(storeOrConfig)) {
      return (store: T) => func(store, storeOrConfig);
    }
    return func((storeOrConfig as T), config);
  };
}
