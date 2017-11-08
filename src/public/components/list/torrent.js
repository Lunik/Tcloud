import React from 'react'
import $ from 'jquery'
import List from '@react-mdc/list'
import io from 'socket.io-client'

import Notify from '../notification'

import TorrentListItem from './item/torrent'

export default class TorrentList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      peers: [],
      updateInterval: null
    }

    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {})
  }

  componentWillReceiveProps (props) {
    this.initState(props)
  }

  componentWillMount () {
    this.update()
    this.socket = io.connect(window.location.origin, {transports: ['websocket'], secure: window.location.protocol === 'https:'})
    this.socket.on('torrent', (message) => this.updateSocket(message.code, message.peer))
    this.state.updateInterval = setInterval(() => this.update(), 30000)
  }

  componentWillUnmount () {
    this.socket.close()
    clearInterval(this.state.updateInterval)
  }

  updateSocket (code, peer) {
    let tempPeers = this.state.peers

    let index = tempPeers.findIndex((e) => e.uid === peer.uid)
    let name = peer.metadata.name ? peer.metadata.name : peer.magnet
    switch (code) {
      case 'new':
        if (index === -1) {
          Notify({
            type: 'info',
            title: 'Start downloading',
            content: (
              <p>{name}</p>
            )
          })
          tempPeers.push(peer)
        }
        break
      case 'done':
        if (index !== -1) {
          Notify({
            type: 'info',
            title: 'Finish downloading',
            content: (
              <p>{name}</p>
            )
          })

          tempPeers.splice(index, 1)
        }
        break
      case 'stop':
        if (index !== -1) {
          Notify({
            type: 'warning',
            title: 'Stop downloading',
            content: (
              <p>{name}</p>
            )
          })

          tempPeers.splice(index, 1)
        }
        break
      case 'error':
        if (index !== -1) {
          Notify({
            type: 'error',
            title: 'Failed to download',
            content: (
              <p>{name}</p>
            )
          })

          tempPeers.splice(index, 1)
        }
        break
    }

    try {
      this.setState({
        peers: tempPeers
      })
    } catch (e) {
      this.state.peers = tempPeers
    }
  }

  update () {
    $.ajax({
      method: 'GET',
      url: `/torrent`,
      success: (response) => {
        this.setState({
          peers: response
        })
      }
    }).fail((response) => {
      let text = response.responseJSON.err

      Notify({
        type: 'error',
        title: 'Failed to fetch peers',
        content: (
          <p>{text}</p>
        )
      })
    })
  }

  handleRemove () {
    setTimeout(() => this.update(), 1000)
  }

  render () {
    const peers = this.state.peers.map((peer, key) => <TorrentListItem key={key} color={key % 2} peer={peer} onRemove={() => this.handleRemove()}/>)
    return (
      <List className="list" id="peer">
        {peers}
      </List>
    )
  }
}
