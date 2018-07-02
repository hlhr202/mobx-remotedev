import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { observer, Provider, inject } from 'mobx-react'
import Counter from './store'

interface IInjectProps {
    counter: Counter
}

@inject('counter')
@observer
class HelloWorld extends React.Component {
    get store() {
        return this.props as IInjectProps
    }
    render() {
        return (
            <div>
                <p>count: {this.store.counter.count}</p>
                <button onClick={this.store.counter.decrement}>decrement</button>
                <button onClick={this.store.counter.increment}>increment</button>
            </div>
        )
    }
}

class Root extends React.Component {
    render() {
        return (
            <Provider counter={new Counter()}>
                <HelloWorld />
            </Provider>
        )
    }
}

ReactDOM.render(<Root />, document.getElementById('root'))