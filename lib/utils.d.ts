import * as mobx from 'mobx';
interface IChange {
    added?: any;
    addedCount?: any;
    index?: any;
    removed?: any;
    removedCount?: any;
    newValue?: any;
    name: string;
}
export declare function createAction(name: string, change?: IChange): any;
export declare function getName(obj: any): string;
export declare const silently: (fn: any, store: any) => void;
declare function setValueAction(store: any, state: any): any;
export declare const setValue: typeof setValueAction & mobx.IAction;
export {};
