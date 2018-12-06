import {Component} from 'react'
import { Checkbox } from 'antd';
import {log} from 'utils'

class CellCheck extends Component {

  onChange = (key) => {
    log.debug(key)
    this.props.colDef.onCheck(key)
  }

  UNSAFE_componentWillReceiveProps(nextProps){

  }

  render () {

    if(this.props.value && this.props.value[this.props.colDef.index] !== ''){
      let key = `${this.props.data.resourceCode}_${this.props.value[this.props.colDef.index]}`
      let checked = false
      if(this.props.agGridReact.props.checkList.indexOf(key) > -1){
        checked = true
      }
      return <Checkbox checked={checked} onChange={() => this.onChange(key)} disabled={this.props.agGridReact.props.detail} />
    } else{
      return ''
    }

  }
}

export {CellCheck}

