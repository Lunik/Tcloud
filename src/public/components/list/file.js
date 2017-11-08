import React from 'react'
import $ from 'jquery'
import List from '@react-mdc/list'
import io from 'socket.io-client'

import Notify from '../notification'

import Loading from '../loading'
import FileListItem from './item/file'
import Tree from '../tree'

export default class FileList extends React.Component {
  constructor (props) {
    super(props)

    this.storageID = '__files'

    let fromCache = this.loadCache() || {}
    this.state = {
      files: fromCache.childs || [],
      size: fromCache.size || 0,
      loading: false,
      updateInterval: null
    }

    this.initState(props)
  }

  initState (props) {
    Object.assign(this.state, {
      location: window.location.hash.substring(1)
    })
  }

  componentWillReceiveProps (props) {
    this.initState(props)
  }

  componentWillMount () {
    $(window).on('hashchange', () => this.handleHashCHange())
    this.update()
    this.socket = io.connect(window.location.origin, {transports: ['websocket'], secure: window.location.protocol === 'https:'})
    this.socket.on('folder', (folder) => this.updateSocket(folder))
    this.state.updateInterval = setInterval(() => this.update(), 30000)
  }

  componentWillUnmount () {
    $(window).off('hashchange', () => this.handleHashCHange())
    this.socket.close()
    clearInterval(this.state.updateInterval)
  }

  handleHashCHange () {
    this.changeDir(window.location.hash.substring(1))
  }

  updateSocket (folder) {
    folder = follow(window.location.hash.substring(1), folder)

    if (folder === null) {
      window.location.hash = '#'
      return null
    }

    try {
      this.setState({
        files: folder.childs,
        size: folder.size
      })
    } catch (e) {
      this.state.files = folder.childs
      this.state.size = folder.size
    }

    this.saveCache(folder)
  }

  update () {
    $.ajax({
      method: 'GET',
      url: `/folder/${this.state.location}`,
      success: (response) => {
        this.setState({
          files: response.childs,
          size: response.size,
          loading: false
        })

        this.saveCache(response)
      }
    }).fail((response) => {
      let text = response.responseJSON.err

      this.setState({
        loading: false
      })

      Notify({
        type: 'error',
        title: 'Failed to fetch files',
        content: (
          <p>{text}</p>
        )
      })
    })
  }

  changeDir (dir) {
    let fromCache = this.loadCache() || {}
    this.setState({
      location: dir,
      loading: true,
      files: fromCache.childs || [],
      size: fromCache.size || 0
    })
    this.update()
  }

  getSizeItem (bytes) {
    var sizes = ['o', 'ko', 'mo', 'go', 'to']
    if (bytes === 0) { return '0 b' }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`
  }

  saveCache (folder) {
    let hash = window.location.hash.substring(1)
    let base64Hash = btoa(hash)
    window.localStorage.setItem(`${this.storageID}_${base64Hash}`, JSON.stringify(folder))
  }

  loadCache () {
    let hash = window.location.hash.substring(1)
    let base64Hash = btoa(hash)
    return JSON.parse(window.localStorage.getItem(`${this.storageID}_${base64Hash}`))
  }

  render () {
    const files = this.state.files.map((file, key) => <FileListItem
      key={key}
      color={key % 2}
      file={file}
      onRemove={() => this.update()}
      onRename={() => this.update()}/>)
    return (
      <List className="list" id="file">
        <Loading hidden={!this.state.loading}/>
        {this.getSizeItem(this.state.size)}
        <Tree path={this.state.location} />
        {files}
      </List>
    )
  }
}

function removeBlank (array, begin) {
  begin = begin || 0
  for (var i = begin; i < array.length; i++) { // Begining at 1 to prevent first backslash removing
    if (array[i] === '' || array[i] === null) {
      array.splice(i, 1)
      i--
    }
  }
  return array
}

function findChild (folder, name) {
  for (let i = 0; i < folder.childs.length; i++) {
    if (folder.childs[i].name === name) {
      return folder.childs[i]
    }
  }
  return null
}

function follow (path, folder) {
  var current = folder

  path = path.split('/')
  removeBlank(path, 0)

  let i = 0
  while (current.hasOwnProperty('childs') && i < path.length) {
    current = findChild(current, path[i])
    i++
    if (current === null) {
      return null
    }
  }

  if (i < path.length - 1) {
    return null // Path do not exist
  } else {
    return current
  }
}
