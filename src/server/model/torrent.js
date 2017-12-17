import fs from 'fs-extra'
import { spawn } from 'child_process'
import Delogger from 'delogger'
import EventEmitter from 'events'

import Peer from './peer'
import Config from './config'
import Folder from '../model/folder'

const config = new Config({sync: true})

export default class Torrent extends EventEmitter {
  constructor (props) {
    super(props)

    props = props || {}
    this.baseFolder = props.baseFolder || new Folder(`/${__dirname}/${config.files.path}`, '')
    this.peers = {}
    this.log = new Delogger('Torrent')
  }

  download (magnet) {
    var peer = new Peer({
      magnet: magnet
    })

    this.peers[peer.uid] = peer

    this.peers[peer.uid].on('done', (peer) => this.handlePeerDone(peer))
    this.peers[peer.uid].on('stop', (peer) => this.handlePeerStop(peer))
    this.peers[peer.uid].on('error', (peer) => this.handlePeerError(peer))
    this.peers[peer.uid].on('download', (peer) => this.emit('download', peer))
    this.peers[peer.uid].on('metadata', (peer) => this.emit('metadata', peer))

    this.emit('new', peer)
    return this.peers[peer.uid]
  }

  handlePeerStop (peer) {
    this.emit('stop', peer)
    this.cleanup(peer)
  }

  handlePeerDone (peer) {
    // var newPath = `${__dirname}/${config.files.path}/${peer.metadata.name}`

    /*
    var oldPath = peer.metadata.fullPath
    var mainFolder = `${__dirname}/${config.files.path}`
    var temp = `${__dirname}/${config.files.tmp}/${peer.metadata.name}`
    var newPath = `${mainFolder}/${peer.metadata.name}`

    var childs = fs.readdirSync(mainFolder)

    if (childs.indexOf(peer.metadata.name) === -1) {
      const mv = spawn('mv', [oldPath, temp])
      mv.stderr.on('data', (data) => {
        this.log.error(data)
      })

      mv.on('close', (code) => {
        const mv2 = spawn('mv', [temp, newPath])
        mv2.stderr.on('data', (data) => {
          this.log.error(data)
        })
        mv2.on('close', (code) => {
          this.log.info(`Copied ${oldPath} to ${mainFolder} successfully`)

          this.cleanup(peer)
        })
      })
    } else {
      this.cleanup(peer)
    }

    */

    var oldPath = peer.metadata.fullPath
    var mainFolder = `${__dirname}/${config.files.path}`
    var newPath = `${mainFolder}/${peer.metadata.name}`

    var childs = fs.readdirSync(mainFolder)

    if (childs.indexOf(peer.metadata.name) === -1) {
      fs.rename(oldPath, newPath, (err) => {
        if (err) this.log.error(err)
        this.cleanup(peer)
      })
    } else {
      this.cleanup(peer)
    }

    this.emit('done', peer)
  }

  handlePeerError (peer) {
    this.log.error(`Unable to download ${peer.magnet}`)
    this.emit('error', peer)
    delete this.peers[peer.uid]
  }

  cleanup (peer) {
    if (peer.metadata.path) {
      fs.remove(peer.metadata.fullPath, () => delete this.peers[peer.uid])
    } else {
      delete this.peers[peer.uid]
    }
  }
}
