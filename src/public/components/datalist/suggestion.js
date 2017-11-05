import React from 'react'

import Datalist from './index'

export default class SuggestionInput extends React.Component {
  constructor (props) {
    super(props)

    this.storageID = '__SearchSuggestions'
    this.state = {
      items: []
    }

    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {})
    this.load()
  }

  componentWillReceiveProps (props) {
    this.initState(props)
  }

  addItem (item) {
    if (this.state.items.indexOf(item) === -1) {
      let temp = this.state.items
      temp.push(item)

      this.setState({
        items: temp
      })

      this.save()
    }
  }

  save () {
    window.localStorage.setItem(this.storageID, JSON.stringify(this.state.items))
  }

  load () {
    try {
      let stored = JSON.parse(window.localStorage.getItem(this.storageID))

      if (!stored) {
        throw new Error('LocalStorage empty')
      }

      this.state.items = JSON.parse(window.localStorage.getItem(this.storageID))
    } catch (e) {
      this.state.items = []
      this.save()
    }
  }

  render () {
    return (
      <Datalist id={this.props.id} items={this.state.items}/>
    )
  }
}
