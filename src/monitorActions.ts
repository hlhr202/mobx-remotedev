import * as mobx from 'mobx';
const { stringify, parse } = require('jsan');
const { getMethods, evalMethod } = require('remotedev-utils');
import { silently, setValue } from './utils';

export const isMonitorAction = (store: any) => store.__isRemotedevAction === true;

function dispatch(store: any, { type, arguments: args }: any) {
  if (typeof store[type] === 'function') {
    silently(() => { store[type](...args); }, store);
  }
}

function dispatchRemotely(devTools: any, store: any, payload: any) {
  try {
    evalMethod(payload, store);
  } catch (e) {
    devTools.error(e.message);
  }
}

function toggleAction(store: any, id: any, strState: any) {
  const liftedState = parse(strState);
  const idx = liftedState.skippedActionIds.indexOf(id);
  const skipped = idx !== -1;
  const start = liftedState.stagedActionIds.indexOf(id);
  if (start === -1) return liftedState;

  setValue(store, liftedState.computedStates[start - 1].state);
  for (let i = (skipped ? start : start + 1); i < liftedState.stagedActionIds.length; i++) {
    if (
      i !== start && liftedState.skippedActionIds.indexOf(liftedState.stagedActionIds[i]) !== -1
    ) continue; // it's already skipped
    dispatch(store, liftedState.actionsById[liftedState.stagedActionIds[i]].action);
    liftedState.computedStates[i].state = mobx.toJS(store);
  }

  if (skipped) {
    liftedState.skippedActionIds.splice(idx, 1);
  } else {
    liftedState.skippedActionIds.push(id);
  }
  return liftedState;
}

export function dispatchMonitorAction(store: any, devTools: any, onlyActions: boolean) {
  const initValue = mobx.toJS(store.store);
  devTools.init(initValue, getMethods(store));

  return (message: any) => {
    if (message.type === 'DISPATCH') {
      switch (message.payload.type) {
        case 'RESET':
          devTools.init(setValue(store.store, initValue));
          return;
        case 'COMMIT':
          devTools.init(mobx.toJS(store.store));
          return;
        case 'ROLLBACK':
          devTools.init(setValue(store.store, parse(message.state)));
          return;
        case 'JUMP_TO_STATE':
        case 'JUMP_TO_ACTION':
          setValue(store.store, parse(message.state));
          return;
        case 'TOGGLE_ACTION':
          if (!onlyActions) {
            console.warn(
              '`onlyActions` parameter should be `true` to skip actions: ' +
              'https://github.com/zalmoxisus/mobx-remotedev#remotedevstore-config'
            );
            return;
          }
          devTools.send(null, toggleAction(store.store, message.payload.id, message.state));
          return;
        case 'IMPORT_STATE': {
          const { nextLiftedState } = message.payload;
          const { computedStates } = nextLiftedState;
          setValue(store.store, computedStates[computedStates.length - 1].state);
          devTools.send(null, nextLiftedState);
          return;
        }
      }
    } else if (message.type === 'ACTION') {
      dispatchRemotely(devTools, store.store, message.payload);
    }
  };
}
