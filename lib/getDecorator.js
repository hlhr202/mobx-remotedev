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
function getDecorator(func) {
    return function (storeOrConfig, config) {
        if (typeof storeOrConfig === 'object' && !mobx.isObservable(storeOrConfig)) {
            return function (store) { return func(store, storeOrConfig); };
        }
        return func(storeOrConfig, config);
    };
}
exports.default = getDecorator;
