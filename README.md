# Mobx Remote Dev

[![npm](https://img.shields.io/npm/v/@hlhr202/mobx-remotedev.svg)](https://www.npmjs.com/package/@hlhr202/mobx-remotedev)
This is a modified version of mobx-remotedev, the original repository can be found in [zalmoxisus/mobx-remotedev](https://github.com/zalmoxisus/mobx-remotedev)

This version is typescript friendly

Remote debugging for MobX with [Redux DevTools extension](https://github.com/zalmoxisus/redux-devtools-extension) (and [remotedev](https://github.com/zalmoxisus/remotedev) coming soon)

![Demo](https://raw.githubusercontent.com/hlhr202/mobx-remotedev/ts/demo.gif) 

## Installation

#### 1. Get the extension
##### 1.1 For Chrome
 - from [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

##### 1.2 For Firefox
 - from [AMO](https://addons.mozilla.org/en-US/firefox/addon/remotedev/)

##### 1.3 For Electron
  - just specify `REDUX_DEVTOOLS` in [`electron-devtools-installer`](https://github.com/GPMDP/electron-devtools-installer).

##### 1.4 For other browsers, for React Native, hybrid, desktop and server side apps
  - Use [remotedev.io](http://remotedev.io/local/) or if you have the extension select `Remote DevTools` from the context menu. Just specify `remote` parameter, and optionally `hostname` and `port`. [See the API](https://github.com/zalmoxisus/mobx-remotedev#remotedevstore-config) for details. 

#### 2. Install the library

```
npm install --save @hlhr202/mobx-remotedev
```

## Usage

- To keep stores in order, a single root store is recommended
- I suggest to use ES decorator or enable typescript experimental decorator

```jsx

// ============== Define Store1 and Store2 ==============
/* Store1.js */
import { observable, action } from "mobx"
import RootStore from "RootStore.js"

export default class Store1 {
    constructor(rootStore) {
        this.rootStore = rootStore
    }
    @observable field = ''
    @action changeField = () => {
      this.field = '123'
    }
    //blah blah blah...
}

/* Store2.js */
import { observable, action } from "mobx"
import RootStore from "RootStore.js"

export default class Store2 {
    constructor(rootStore) {
        this.rootStore = rootStore
    }
    @observable field = ''
    @action changeSomethingInBothStores = () => {
      this.field = '234'
      this.rootStore.store1.changeField()
    }
    //blah blah blah...
}

// ============== Combine Store1 and Store2 as single store ==============
/* RootStore.js */
import remotedev from '@hlhr202/mobx-remotedev'
import Store1 from 'Store1.js'
import Store2 from 'Store2.js'

@remotedev(/* config */)
export default class RootStore {
    public store1 = new Store1(this)
    public store2 = new Store2(this)
}

// ============== Use single store in React ==============
/* index.js */
import { Provider, observer, inject } from 'mobx-react'
import RootStore.js from 'RootStore.js'

@inject('store1')
@inject('store2')
@observer
class Main extends React.Component {
    render() {
        return (
            <div>
                <p>field in store1: {this.props.store1.field}</p>
                <p>field in store1: {this.props.store2.field}</p>
                <button onClick={() => this.props.store2.changeSomethingInBothStores()}> changeSomething </button>
            </div>
        )
    }
}

class Root extends React.Component {
    render() {
        return (
            <Provider {...new RootStore()}>
                <Main />
            </Provider>
        )
    }
}
```


## API
#### `remotedev(store, [config])`
  - arguments
    - **store** *observable or class* to be monitored. In case you want to change its values (to time travel or cancel actions), you should export its result as in the example above (so we can extend the class). 
    - **config** *object* (optional as the parameters bellow)
      - **name** *string* - the instance name to be showed on the monitor page. Default value is document.title.
      - **onlyActions** *boolean* - set it to `true` to have a clear log only with actions. If MobX is in strict mode, it is `true` by default. Don't forget about [async actions](https://github.com/zalmoxisus/mobx-remotedev#how-to-handle-async-actions).
      - **global** *boolean* - set it to `true` in order to assign dispatching of all unhandled actions to this store. Useful for nested classes / observables or when having async actions without specifying the `scope` explicitly. 
      - **filters** *object* - map of arrays named `whitelist` or `blacklist` to filter action types. You can also set it globally in the extension settings.
        - **blacklist** *array of (regex as string)* - actions to be hidden in DevTools.
        - **whitelist** *array of (regex as string)* - all other actions will be hidden in DevTools (the `blacklist` parameter will be ignored).
      - **remote** *boolean* - set it to `true` to have remote monitoring via the local or `remotedev.io` server. `remote: false` is used for [the extension](https://github.com/zalmoxisus/redux-devtools-extension) or [react-native-debugger](https://github.com/jhen0409/react-native-debugger)
      - **hostname** *string* - use to specify host for [`remotedev-server`](https://github.com/zalmoxisus/remotedev-server). If `port` is specified, default value is `localhost`.
      - **port** *number* - use to specify host's port for [`remotedev-server`](https://github.com/zalmoxisus/remotedev-server).

Also see [the extension API](https://github.com/zalmoxisus/redux-devtools-extension#documentation) and [my presentation at React Europe](https://youtu.be/YU8jQ2HtqH4).

## Exclude / include DevTools in production builds

By default use
```js
import remotedev from '@hlhr202/mobx-remotedev';
```

It will work only when `process.env.NODE_ENV === 'development'`, otherwise the code will be stripped.

In case you want to use it in production or cannot set `process.env.NODE_ENV`, use
```js
import remotedev from '@hlhr202/mobx-remotedev/lib/dev';
```
So, the code will not be stripped from production bundle and you can use the extension even in production. It wouldn't affect the performance for end-users who don't have the extension installed. 

## FAQ

### How to monitor (show changes) for inner items

Use `remotedev` function for them as well. [Example](https://github.com/zalmoxisus/mobx-remotedev/blob/master/examples/simple-todo/index.js#L22) 

### How to set data correctly when time traveling

By default it will try to set the properties of the class or observable object, but, if you have an `importState` method, it will be used. [Example](https://github.com/zalmoxisus/mobx-remotedev/blob/master/examples/todomvc/src/stores/TodoStore.js#L56)

### How to disable computations when time traveling

Check `__isRemotedevAction` of your class or observable object, which will be set to true when it's a monitor action. [Example](https://github.com/zalmoxisus/mobx-remotedev/blob/master/examples/todomvc/src/stores/TodoStore.js#L22)  

### How to handle async actions

Use `runInAction` and don't forget about the second / third parameter which will be `this` if you're using arrow functions. If you don't want to specify it, set the `global` parameter to `true`. [Example](https://github.com/zalmoxisus/mobx-remotedev/blob/master/examples/counter/stores/appState.js#L14)  

### How to show actions for nested classes / observables

Just set the `global` parameter to `true` like `remotedev(store, { global: true })`. If you want more details about the nested tree, see [#5](https://github.com/zalmoxisus/mobx-remotedev/pull/5).  

## LICENSE

[MIT](LICENSE)

## Authors
- Creted by [@mdiordiev](https://twitter.com/mdiordiev)
- Modified by [@hlhr202](https://github.com/hlhr202)
