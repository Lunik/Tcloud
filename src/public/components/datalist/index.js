import React from 'react'

export default class Datalist extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      items: []
    }

    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {
      items: props.items
    })
  }

  componentWillReceiveProps (props) {
    this.initState(props)
  }

  render () {
    let items = this.state.items.map((item) => (
      <option key={item} value={item}/>
    ))
    return (
      <datalist id={this.props.id}>
        {items}
      </datalist>
    )
  }
}
