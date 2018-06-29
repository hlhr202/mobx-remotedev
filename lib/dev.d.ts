export interface IFilter {
    blacklist?: string[];
    whitelist?: string[];
}
export interface Config {
    name?: string;
    onlyActions?: boolean;
    global?: boolean;
    filters?: IFilter;
    remote?: boolean;
    hostname?: string;
    port?: number;
}
export interface IStore {
    name?: string;
    new (): any;
}
export interface IDevStore {
    store: any;
}
declare const _default: (storeOrConfig: any, config?: Config) => any;
export default _default;
