import React from 'react'
import List from '@react-mdc/list'
import $ from 'jquery'
import io from 'socket.io-client'

import Notify from '../../notification'
import Color from '../../../style/theme'

import { ArrowIcon, HeartIcon } from '../../image/svg'
import TorrentToolbox from '../../toolbox/torrent'
import RadialProgress from '../../progress/radial'

export default class TorrentListItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {
      mobile: window.innerWidth <= 650,
      peer: props.peer
    })
  }

  componentWillReceiveProps (props) {
    this.initState(props)
  }

  componentWillMount () {
    $(window).on('resize', (event) => this.handleWindowResize())
    this.update()
    this.socket = io.connect(window.location.origin, {transports: ['websocket'], secure: window.location.protocol === 'https:'})
    this.socket.on(`peer-${this.state.peer.uid}`, (peer) => this.updateSocket(peer))
  }

  componentWillUnmount () {
    $(window).off('resize', (event) => this.handleWindowResize())
    this.socket.close()
  }

  handleWindowResize () {
    console.log('ok')
    this.setState({
      mobile: window.innerWidth <= 650
    })
  }

  updateSocket (peer) {
    try {
      this.setState({
        peer: peer
      })
    } catch (e) {
      this.state.peer = peer
    }
  }

  update () {
    $.ajax({
      method: 'GET',
      url: this.state.peer.url,
      success: (response) => {
        this.setState({
          peer: response
        })
      }
    }).fail((response) => {
      let text = response.responseJSON.err

      Notify({
        type: 'error',
        title: `Failed to fetch peer ${this.peer.uid}`,
        content: (
          <p>{text}</p>
        )
      })
    })
  }

  getSizeItem (bytes) {
    var sizes = ['o', 'ko', 'mo', 'go', 'to']
    if (bytes) {
      if (bytes === 0) { return '0 b' }
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
      return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`
    } else {
      return `0 ${sizes[0]}`
    }
  }

  getSpeedItem (bytes) {
    var sizes = ['b', 'kb', 'mb', 'gb', 'tb']
    if (bytes) {
      var bits = bytes * 8
      if (bits === 0) { return '0 b' }
      var i = parseInt(Math.floor(Math.log(bits) / Math.log(1024)), 10)
      return `${Math.round(bits / Math.pow(1024, i), 2)} ${sizes[i]}/s`
    } else {
      return `0 ${sizes[0]}/s`
    }
  }

  getProgressItem (percent) {
    if (percent) {
      return Math.floor(percent * 100) + '%'
    } else {
      return 0 + '%'
    }
  }

  getSeedNum (seed) {
    if (seed) {
      if (seed >= 100) {
        return '99+'
      }

      return seed
    } else {
      return 0
    }
  }

  handleRemove () {
    this.props.onRemove()
    clearInterval(this.state.updateInterval)
    this.setState({
      updateInterval: null
    })
  }

  render () {
    const itemStyle = Object.assign({}, style.item, !this.props.color ? style.itemColor : {})
    const metadataStyle = Object.assign({}, style.metadata, this.state.mobile ? style.metadataMobile : {})

    return (
      <List.Item className="peer" style={itemStyle}>
        <span className="name" style={style.name}>
          {this.state.peer.metadata.name}
        </span>
        <span className="metadata" style={metadataStyle}>
          <span className="size" style={style.size}>{this.getSizeItem(this.state.peer.metadata.size)}</span>
          <span className="seed" style={style.seed}>
            {this.getSeedNum(this.state.peer.metadata.seed)}
            <HeartIcon style={style.seedIcon}/>
          </span>
          <span className="sdown" style={style.sdown}>
            {this.getSpeedItem(this.state.peer.metadata.sdown)}
            <ArrowIcon.Down style={style.sdownIcon}/>
          </span>
          <span className="sup" style={style.sup}>
            {this.getSpeedItem(this.state.peer.metadata.sup)}
            <ArrowIcon.Up style={style.supIcon}/>
          </span>
        </span>
        <span className="progress" style={style.progress}>
          {this.getProgressItem(this.state.peer.metadata.progress)}
          <RadialProgress
            style={style.progressRadial}
            displayText={false}
            value={this.state.peer.metadata.progress} />
        </span>
        <List.Item.EndDetail style={style.endDetail}>
          <TorrentToolbox
            onRemove={ () => this.handleRemove() }
            peer={this.state.peer}/>
        </List.Item.EndDetail>
      </List.Item>
    )
  }
}

TorrentListItem.defaultProps = {
  color: 1,
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
      seed: 1700,
      progress: 0.5458,
      timeRemaining: 1404705
    },
    uid: '000',
    url: '/peer/000'
  },
  onRemove: () => {}
}

const style = {
  item: {
    height: '30px',
    paddingLeft: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    minWidth: 'Z00px',
    overflow: 'visible'
  },
  itemColor: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottom: 'none'
  },
  name: {
    flex: '5',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  metadata: {
    display: 'flex',
    flex: '2'
  },
  metadataMobile: {
    display: 'none'
  },
  seed: {
    flex: '2',
    textAlign: 'right',
    minWidth: '55px',
    marginRight: '10px'
  },
  seedIcon: {
    marginLeft: '5px',
    fill: Color.red,
    verticalAlign: 'top'
  },
  sdown: {
    flex: '2',
    textAlign: 'right',
    minWidth: '100px',
    marginRight: '10px'
  },
  sdownIcon: {
    marginLeft: '5px',
    fill: Color.lightBlue,
    verticalAlign: 'top'
  },
  sup: {
    flex: '2',
    textAlign: 'right',
    minWidth: '100px',
    marginRight: '10px'
  },
  supIcon: {
    marginLeft: '5px',
    fill: Color.red,
    verticalAlign: 'top'
  },
  size: {
    flex: '2',
    textAlign: 'right',
    minWidth: '60px',
    marginRight: '10px'
  },
  progress: {
    flex: '1',
    textAlign: 'right',
    minWidth: '60px'
  },
  progressRadial: {
    marginLeft: '5px',
    verticalAlign: 'top'
  },
  endDetail: {
    marginRight: '10px'
  }
}
