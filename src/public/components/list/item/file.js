import React from 'react'
import List from '@react-mdc/list'
import $ from 'jquery'

import Color from '../../../style/theme'

import { LockIcon, FileIcon, DownloadIcon } from '../../image/svg'
import FileToolbox from '../../toolbox/file'

export default class FileListItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
    this.initState(props)
  }

  initState (props) {
    let ext = props.file.type === 'file' ? props.file.name.split('.').slice(-1)[0] : 'folder'
    Object.assign(this.state, {
      locked: props.file.locked,
      extension: ext,
      fileIcon: FileIcon.getFromExtension(ext),
      mobile: window.innerWidth <= 700
    })
  }

  componentWillMount () {
    $(window).on('resize', (event) => this.handleWindowResize())
  }

  componentWillUnmount () {
    $(window).off('resize', (event) => this.handleWindowResize())
  }

  handleWindowResize () {
    this.setState({
      mobile: window.innerWidth <= 700
    })
  }

  componentWillReceiveProps (props) {
    this.initState(props)
  }

  getNameItem () {
    if (this.props.file.type === 'file') {
      return this.props.file.name
    } else {
      return (
        <a href={`#${this.props.file.path}`}>
          {this.props.file.name}
        </a>
      )
    }
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

  getDateItem (mtime) {
    let d = new Date(mtime)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
  }

  render () {
    const lockStyle = Object.assign({}, style.lock, this.state.locked ? style.locked : {})
    const itemStyle = Object.assign({}, style.item, !this.props.color ? style.itemColor : {})
    const downloadCountStyle = Object.assign({}, style.downloadCount, this.props.file.type === 'folder' ? style.downloadCountHidden : {})
    const dateStyle = Object.assign({}, style.date, this.state.mobile ? style.dateMobile : {})

    return (
      <List.Item className="file" type={this.props.file.type} style={itemStyle}>
        <List.Item.StartDetail style={style.startDetail}>
          <this.state.fileIcon />
        </List.Item.StartDetail>
        <span className="name" style={style.name}>
          {this.getNameItem()}
        </span>
        <span className="date" style={dateStyle}>
          {this.getDateItem(this.props.file.mtime)}
        </span>
        <span className="size" style={style.size}>{this.getSizeItem(this.props.file.size)}</span>
        <span className="download-count" style={downloadCountStyle}>
          {this.props.file.downloadCount}
          <DownloadIcon style={style.downloadCountIcon}/>
        </span>
        <span className="locked" style={lockStyle}>
          <LockIcon style={style.lockIcon}/>
        </span>
        <List.Item.EndDetail style={style.endDetail}>
          <FileToolbox
            onRemove={ () => this.props.onRemove() }
            onRename={() => this.props.onRename()}
            file={this.props.file}/>
        </List.Item.EndDetail>
      </List.Item>
    )
  }
}

FileListItem.defaultProps = {
  color: 1,
  file: {
    name: 'file',
    mtime: null,
    type: 'file',
    locked: true,
    downloadCount: 0,
    size: 0,
    childs: [],
    url: '/folder',
    download: null
  },
  onRemove: () => {}
}

const style = {
  item: {
    height: '30px',
    paddingLeft: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    minWidth: '300px',
    overflow: 'visible'
  },
  itemColor: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottom: 'none'
  },
  startDetail: {
    marginRight: '10px'
  },
  name: {
    flex: '5',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  date: {
    flex: '3'
  },
  dateMobile: {
    display: 'none'
  },
  lock: {
    visibility: 'hidden',
    flex: '1',
    textAlign: 'center'
  },
  locked: {
    visibility: 'visible'
  },
  lockIcon: {
    fill: Color.red
  },
  downloadCount: {
    flex: '1',
    textAlign: 'right',
    minWidth: '50px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  downloadCountHidden: {
    visibility: 'hidden'
  },
  downloadCountIcon: {
    marginLeft: '5px',
    fill: Color.lightBlue,
    verticalAlign: 'top'
  },
  size: {
    flex: '1',
    textAlign: 'right',
    minWidth: '70px'
  },
  endDetail: {
    marginRight: '10px'
  }
}
