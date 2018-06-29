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
var getPayload = function (change) {
    var added = change.added, addedCount = change.addedCount, index = change.index, removed = change.removed, removedCount = change.removedCount;
    return {
        index: index,
        added: added && mobx.toJS(added),
        addedCount: addedCount,
        removed: removed && mobx.toJS(removed),
        removedCount: removedCount
    };
};
function createAction(name, change) {
    var _a;
    if (!change) { // is action
        return { type: name };
    }
    var action;
    if (typeof change.newValue !== 'undefined') {
        var key = typeof change.index !== 'undefined' ? change.index : change.name;
        action = (_a = {}, _a[key] = mobx.toJS(change.newValue), _a);
    }
    else {
        action = getPayload(change);
    }
    action.type = "\u2503 " + name;
    return action;
}
exports.createAction = createAction;
function getName(obj) {
    if (!obj || !mobx.isObservable(obj))
        return '';
    var r = mobx.getDebugName(obj);
    var end = r.indexOf('.');
    if (end === -1)
        end = undefined;
    return r.substr(0, end);
}
exports.getName = getName;
/* eslint-disable no-param-reassign */
exports.silently = function (fn, store) {
    store.__isRemotedevAction = true;
    fn();
    delete store.__isRemotedevAction;
};
function setValueAction(store, state) {
    exports.silently(function () {
        if (store.importState) {
            store.importState(state);
        }
        else {
            Object.keys(state).forEach(function (key) {
                store[key] = state[key];
            });
        }
    }, store);
    return state;
}
setValueAction.__isRemotedevAction = true;
exports.setValue = mobx.action('@@remotedev', setValueAction);
/* eslint-enable */
