import { Config } from './dev';
export default function getDecorator<T>(func: (store: T, storeOrConfig?: T | Config) => T): (storeOrConfig: Config | T, config?: Config) => T | ((store: T) => T);
