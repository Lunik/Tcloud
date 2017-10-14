import React from 'react'
import $ from 'jquery'

import Notify from '../../../notification'
import Color from '../../../../color'

import ListItem from '../default'
import { CrossIcon } from '../../../image/svg'
import DialogWindow from '../../../dialog/default'
import Loading from '../../../loading'

export default class RemoveToolboxItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      dialogOpen: false,
      loading: false
    }

    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {})
  }

  componentWillReceiveProps (props) {
    this.initState(props)
  }

  handleClick () {
    this.setState({dialogOpen: true})
  }

  handleAccept () {
    this.setState({
      dialogOpen: false,
      loading: true
    })

    $.ajax({
      method: 'DELETE',
      url: this.props.peer.url,
      success: (response) => {
        this.setState({
          loading: false
        })

        this.props.onRemove()
      }
    }).fail((response) => {
      let text = response.responseJSON.err

      this.setState({
        loading: false
      })

      Notify({
        type: 'error',
        title: `Failed to delete peer ${this.props.peer.uid}`,
        content: (
          <p>{text}</p>
        )
      })
    })
  }

  handleClose () {
    this.setState({
      dialogOpen: false
    })
  }

  render () {
    return (
      <ListItem
        id="remove" text="Remove"
        icon={CrossIcon}
        onClick={() => this.handleClick()} >
        <Loading hidden={!this.state.loading}/>
        <DialogWindow
          open={this.state.dialogOpen}
          title={`Deleting ${this.props.peer.metadata.name}`}
          onAccept={() => this.handleAccept()}
          onClose={() => this.handleClose()}
          footer={true}>
          <p><b>"{this.props.peer.metadata.name}"</b> will be removed <b>forever</b>.</p>
          <h2>Are you sure ?</h2>
        </DialogWindow>
      </ListItem>
    )
  }
}

RemoveToolboxItem.defaultProps = {
  peer: {
    magnet: 'magnet:?',
    metadata: {
      name: 'TheTorrent',
      size: 2048,
      hash: 'thehash',
      sdown: 10000,
      sup: 250,
      down: 402557,
      up: 4028557,
      seed: 17,
      progress: 0.5458,
      timeRemaining: 1404705
    },
    uid: '000',
    url: '/folder'
  },
  onRemove: () => {}
}
