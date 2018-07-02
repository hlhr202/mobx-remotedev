import { observable, action } from "mobx"
import remotedev from '@hlhr202/mobx-remotedev'

@remotedev({ global: true, onlyActions: true })
export default class Counter {
    @observable count = 0
    @action increment = () => {
        this.count++
    }
    @action decrement = () => {
        this.count--
    }
}
