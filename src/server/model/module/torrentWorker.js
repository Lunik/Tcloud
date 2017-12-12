import WebTorrent from 'webtorrent'
import Delogger from 'delogger'

import Config from '../config'

const config = new Config({sync: true})

class Worker {
  constructor (magnet) {
    this.magnet = magnet
    this.client = new WebTorrent()

    this.log = new Delogger(`Peer(${process.pid})`)

    process.on('message', (message) => this.handleMessage(JSON.parse(message)))
  }

  preprocess (callback) {
    callback()
  }

  start () {
    this.preprocess(() => {
      this._start()
    })
  }

  _start () {
    this.torrent = this.client.add(this.magnet, {
      path: `${__dirname}/../${config.files.tmp}`
    }, (torrent) => {
      this.torrent = torrent
      this.log.info(`Start ${torrent.name}`)

      this.torrent.on('download', (chunkSize) => {
        process.send(JSON.stringify({
          type: 'download',
          metadata: this.getMetadata(this.torrent)
        }))
      })

      this.torrent.on('done', () => {
        this.log.info(`Finish ${torrent.name}`)
        process.send(JSON.stringify({
          type: 'done',
          metadata: this.getMetadata(this.torrent)
        }), () => {
          process.exit(0)
        })
      })

      this.torrent.on('noPeers', () => {
        this.log.warning(`No peers for ${torrent.name}`)
        process.send(JSON.stringify({
          type: 'noPeers',
          metadata: this.getMetadata(this.torrent)
        }))
      })

      this.torrent.on('error', (err) => {
        this.log.error(err)
        process.send(JSON.stringify({
          type: 'error',
          metadata: this.getMetadata(this.torrent)
        }), () => {
          process.exit(1)
        })
      })
    })

    this.torrent.on('metadata', () => {
      process.send(JSON.stringify({
        type: 'metadata',
        metadata: this.getMetadata(this.torrent)
      }))
    })
  }

  handleMessage (message) {
    switch (message.type) {
      case 'stop':
        this.stop()
        break
      default:
        break
    }
  }

  stop () {
    this.client.destroy((err) => {
      process.send(JSON.stringify({
        type: 'stop',
        metadata: this.getMetadata(this.torrent)
      }), () => {
        if (err) {
          this.log.error(err)
          process.exit(1)
        } else {
          this.log.info('Exit properly.')
          process.exit(0)
        }
      })
    })
  }
  getMetadata (torrent) {
    return {
      name: torrent.name,
      path: torrent.path,
      fullPath: `${torrent.path}/${torrent.name}`,
      size: torrent.length,
      hash: torrent.infoHash,
      sdown: torrent.downloadSpeed,
      sup: torrent.uploadSpeed,
      down: torrent.downloaded,
      up: torrent.uploaded,
      seed: torrent._peersLength,
      progress: torrent.progress,
      timeRemaining: torrent.timeRemaining
    }
  }
}

function Main () {
  if (process.argv.length > 2) {
    var magnet = process.argv[2]
    var worker = new Worker(magnet)
    worker.start()
  } else {
    process.exit(1)
  }
}

Main()
