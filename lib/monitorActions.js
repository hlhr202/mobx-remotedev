"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx = __importStar(require("mobx"));
var _a = require('jsan'), stringify = _a.stringify, parse = _a.parse;
var _b = require('remotedev-utils'), getMethods = _b.getMethods, evalMethod = _b.evalMethod;
var utils_1 = require("./utils");
exports.isMonitorAction = function (store) { return store.__isRemotedevAction === true; };
function dispatch(store, _a) {
    var type = _a.type, args = _a.arguments;
    if (typeof store[type] === 'function') {
        utils_1.silently(function () { store[type].apply(store, args); }, store);
    }
}
function dispatchRemotely(devTools, store, payload) {
    try {
        evalMethod(payload, store);
    }
    catch (e) {
        devTools.error(e.message);
    }
}
function toggleAction(store, id, strState) {
    var liftedState = parse(strState);
    var idx = liftedState.skippedActionIds.indexOf(id);
    var skipped = idx !== -1;
    var start = liftedState.stagedActionIds.indexOf(id);
    if (start === -1)
        return liftedState;
    utils_1.setValue(store, liftedState.computedStates[start - 1].state);
    for (var i = (skipped ? start : start + 1); i < liftedState.stagedActionIds.length; i++) {
        if (i !== start && liftedState.skippedActionIds.indexOf(liftedState.stagedActionIds[i]) !== -1)
            continue; // it's already skipped
        dispatch(store, liftedState.actionsById[liftedState.stagedActionIds[i]].action);
        liftedState.computedStates[i].state = mobx.toJS(store);
    }
    if (skipped) {
        liftedState.skippedActionIds.splice(idx, 1);
    }
    else {
        liftedState.skippedActionIds.push(id);
    }
    return liftedState;
}
function dispatchMonitorAction(store, devTools, onlyActions) {
    var initValue = mobx.toJS(store.store);
    devTools.init(initValue, getMethods(store));
    return function (message) {
        if (message.type === 'DISPATCH') {
            switch (message.payload.type) {
                case 'RESET':
                    devTools.init(utils_1.setValue(store.store, initValue));
                    return;
                case 'COMMIT':
                    devTools.init(mobx.toJS(store.store));
                    return;
                case 'ROLLBACK':
                    devTools.init(utils_1.setValue(store.store, parse(message.state)));
                    return;
                case 'JUMP_TO_STATE':
                case 'JUMP_TO_ACTION':
                    utils_1.setValue(store.store, parse(message.state));
                    return;
                case 'TOGGLE_ACTION':
                    if (!onlyActions) {
                        console.warn('`onlyActions` parameter should be `true` to skip actions: ' +
                            'https://github.com/zalmoxisus/mobx-remotedev#remotedevstore-config');
                        return;
                    }
                    devTools.send(null, toggleAction(store.store, message.payload.id, message.state));
                    return;
                case 'IMPORT_STATE': {
                    var nextLiftedState = message.payload.nextLiftedState;
                    var computedStates = nextLiftedState.computedStates;
                    utils_1.setValue(store.store, computedStates[computedStates.length - 1].state);
                    devTools.send(null, nextLiftedState);
                    return;
                }
            }
        }
        else if (message.type === 'ACTION') {
            dispatchRemotely(devTools, store.store, message.payload);
        }
    };
}
exports.dispatchMonitorAction = dispatchMonitorAction;
