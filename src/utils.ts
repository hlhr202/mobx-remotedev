import * as mobx from 'mobx';

interface IChange {
  added?: any
  addedCount?: any
  index?: any
  removed?: any
  removedCount?: any
  newValue?: any
  name: string
}

const getPayload = (change: IChange) => {
  const { added, addedCount, index, removed, removedCount } = change;
  return {
    index,
    added: added && mobx.toJS(added),
    addedCount,
    removed: removed && mobx.toJS(removed),
    removedCount
  };
};

export function createAction(name: string, change?: IChange) {
  if (!change) { // is action
    return { type: name };
  }

  let action!: any;
  if (typeof change.newValue !== 'undefined') {
    const key = typeof change.index !== 'undefined' ? change.index : change.name;
    action = { [key]: mobx.toJS(change.newValue) };
  } else {
    action = getPayload(change);
  }
  action.type = `┃ ${name}`;

  return action;
}

export function getName(obj: any) {
  if (!obj || !mobx.isObservable(obj)) return '';
  let r = mobx.getDebugName(obj);
  let end: any = r.indexOf('.');
  if (end === -1) end = undefined;
  return r.substr(0, end);
}

/* eslint-disable no-param-reassign */
export const silently = (fn: any, store: any) => {
  store.__isRemotedevAction = true;
  fn();
  delete store.__isRemotedevAction;
};

function setValueAction(store: any, state: any) {
  silently(() => {
    if (store.importState) {
      store.importState(state);
    } else {
      Object.keys(state).forEach((key) => {
        store[key] = state[key];
      });
    }
  }, store);
  return state;
}
(setValueAction as any).__isRemotedevAction = true;
export const setValue = mobx.action('@@remotedev', setValueAction);
/* eslint-enable */
