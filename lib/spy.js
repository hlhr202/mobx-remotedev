"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx = __importStar(require("mobx"));
var filters_1 = require("./filters");
var connectViaExtension = require('remotedev').connectViaExtension;
var utils_1 = require("./utils");
var monitorActions_1 = require("./monitorActions");
var isSpyEnabled = false;
var fallbackStoreName;
var stores = {};
var onlyActions = {};
var filters = {};
var monitors = {};
var scheduled = [];
function configure(name, config) {
    if (config === void 0) { config = {}; }
    if (typeof config.onlyActions === 'undefined') {
        onlyActions[name] = mobx._getGlobalState && mobx._getGlobalState().enforceActions;
    }
    else {
        onlyActions[name] = config.onlyActions;
    }
    if (config.filters)
        filters[name] = config.filters;
    if (config.global) {
        if (fallbackStoreName)
            throw Error('You\'ve already defined a global store');
        fallbackStoreName = name;
    }
}
function init(store, config) {
    var name = mobx.getDebugName(store);
    configure(name, config);
    stores[name] = store.store;
    var devTools = connectViaExtension(config);
    devTools.subscribe(monitorActions_1.dispatchMonitorAction(store, devTools, onlyActions[name]));
    monitors[name] = devTools;
}
function schedule(name, action) {
    var toSend;
    if (action && !filters_1.isFiltered(action, filters[name])) {
        toSend = function () { monitors[name].send(action, mobx.toJS(stores[name])); };
    }
    scheduled.push(toSend);
}
function send() {
    if (scheduled.length) {
        var toSend = scheduled.pop();
        if (toSend)
            toSend();
    }
}
function spy(store, config) {
    init(store, config);
    if (isSpyEnabled)
        return;
    isSpyEnabled = true;
    var objName;
    mobx.spy(function (change) {
        if (change.spyReportStart) {
            objName = utils_1.getName(change.object || change.target);
            if (change.type === 'reaction') {
                // TODO: show reactions
                schedule(objName);
                return;
            }
            if (!stores[objName])
                objName = fallbackStoreName;
            if (!stores[objName] || stores[objName].__isRemotedevAction) {
                schedule(objName);
                return;
            }
            if (change.fn && change.fn.__isRemotedevAction) {
                schedule(objName);
                return;
            }
            if (change.type === 'action') {
                var action = utils_1.createAction(change.name);
                if (change.arguments && change.arguments.length)
                    action.arguments = change.arguments;
                if (!onlyActions[objName]) {
                    schedule(objName, __assign({}, action, { type: "\u250F " + action.type }));
                    send();
                    schedule(objName, __assign({}, action, { type: "\u2517 " + action.type }));
                }
                else {
                    schedule(objName, action);
                }
            }
            else if (change.type && mobx.isObservable(change.object)) {
                schedule(objName, !onlyActions[objName] && utils_1.createAction(change.type, change));
            }
        }
        else if (change.spyReportEnd) {
            send();
        }
    });
}
exports.default = spy;
