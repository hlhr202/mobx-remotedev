import * as mobx from 'mobx';
import spy from './spy';
import getDecorator from './getDecorator';

export interface IFilter {
  blacklist?: string[]
  whitelist?: string[]
}

export interface Config {
  name?: string
  onlyActions?: boolean
  global?: boolean
  filters?: IFilter,
  remote?: boolean
  hostname?: string
  port?: number
}

export interface IStore {
  name?: string
  new(): any
}

export interface IDevStore {
  store: any
}

function dev<T extends IStore>(store: T, config?: Config): T {
  if (
    (!config || !config.remote) && (typeof window === 'undefined' || !(window as any).devToolsExtension)
  ) {
    return store;
  }

  if (config) {
    if (!config) config = {};
    if (!config.name) config.name = store.name;

    class DevStore implements IDevStore {
      @mobx.observable readonly store: any
      constructor() {
        this.store = new store()
        spy(this, config as Config)
        return this.store
      }
    }

    return DevStore as T
  }

  return store

}

export default getDecorator<any>(dev);
