"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mobx = __importStar(require("mobx"));
var spy_1 = __importDefault(require("./spy"));
var getDecorator_1 = __importDefault(require("./getDecorator"));
function dev(store, config) {
    if ((!config || !config.remote) && (typeof window === 'undefined' || !window.devToolsExtension)) {
        return store;
    }
    if (config) {
        if (!config)
            config = {};
        if (!config.name)
            config.name = store.name;
        var DevStore = /** @class */ (function () {
            function DevStore() {
                this.store = new store();
                spy_1.default(this, config);
                return this.store;
            }
            __decorate([
                mobx.observable
            ], DevStore.prototype, "store", void 0);
            return DevStore;
        }());
        return DevStore;
    }
    return store;
}
exports.default = getDecorator_1.default(dev);
