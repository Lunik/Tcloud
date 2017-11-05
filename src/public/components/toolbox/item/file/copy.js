import React from 'react'
import copy from 'copy-to-clipboard'

import ListItem from '../default'
import { CopyIcon } from '../../../image/svg'

export default class CopyToolboxItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {
      disabled: props.file.download === null
    })
  }

  componentWillReceiveProps (props) {
    this.initState(props)
  }

  handleClick () {
    copy(window.location.origin + this.props.file.download)
  }

  render () {
    return (
      <ListItem
        disabled={this.state.disabled}
        id="copy" text="Copy link"
        icon={CopyIcon}
        onClick={() => this.handleClick()}/>
    )
  }
}

CopyToolboxItem.defaultProps = {
  file: {
    name: 'file',
    type: 'file',
    locked: true,
    downloadCount: 0,
    size: 0,
    childs: [],
    url: '/folder',
    download: null
  }
}
