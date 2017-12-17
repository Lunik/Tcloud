import fs from 'fs'
import Path from 'path'
import EventEmitter from 'events'
import Delogger from 'delogger'
import Crypto from 'crypto-js'

import Folder from './folder'
import Config from './config'

const config = new Config({sync: true})

export default class File extends EventEmitter {
  constructor (_path, base) {
    super()

    let parsedPath = parsePath(_path)
    this.base = base
    this._path = parsedPath.path
    this.type = 'file'
    this.name = parsedPath.fileName
    this.mtime = null
    this.locked = false
    this.downloadCount = 0
    this.downloading = 0

    this.idle = {
      date: new Date(),
      timeout: 1000
    }

    this.initMetadata()
    this.initWatch()

    this.log = new Delogger('File')
  }
  initWatch () {
    if (this.exist) {
      fs.watch(
        this.fullPath(), {
          recursive: true
        },
        (eventType, filename) => this.watchChange(eventType, filename)
      )
    }
  }

  initMetadata () {
    try {
      let stats = fs.statSync(this.fullPath())
      this.mtime = stats.mtime
      this._size = stats.size // Bytes
      this.exist = true
    } catch (err) {
      this.mtime = null
      this._size = 0
      this.exist = false
    }
  }

  updateMetadata () {
    fs.stat(this.fullPath(), (err, stats) => {
      if (err) {
        this.mtime = null
        this._size = 0
        this.exist = false
      } else {
        this.mtime = stats.mtime
        this._size = stats.size // Bytes
        this.exist = true
      }
    })
  }

  watchChange (eventType, filename) {
    this.updateMetadata()
    this.emitChange()
  }

  emitChange () {
    return new Promise((resolve, reject) => {
      if (new Date() - this.idle.date >= this.idle.timeout) {
        this.idle.date = new Date()
        resolve()
        this.emit('change', this)
      }
    })
  }

  fullPath () {
    return `${this._path}/${this.name}`
  }

  relativePath () {
    let cleanBase = this.base.split('/').slice(2).join('/')
    return Path.join(cleanBase, this.name)
  }

  size () {
    return this._size
  }

  lock () {
    this.locked = true
    this.emit('locked', this)
  }

  unlock () {
    this.locked = false
    this.emit('unlocked', this)
  }

  remove () {
    if (this.locked) {
      return false
    }
    this.log.info(`Removing ${this.fullPath()}`)

    fs.unlink(this.fullPath(), () => this.emit('remove', this))
  }

  addDownloader () {
    this.downloadCount++
    this.downloading++
    this.emit('startDownload', this)
    this.lock()
  }

  removeDownloader () {
    this.downloading--
    this.emit('finishDownload', this)
    if (this.downloading <= 0) {
      this.downloading = 0
      this.unlock()
    }
  }

  rename (name) {
    if (this.locked) {
      return false
    }
    this.log.info(`Renaming ${this.fullPath()} into ${this._path}/${name}`)

    fs.rename(this.fullPath(), `${this._path}/${name}`, () => this.emit('rename', this))
  }

  create () {
    this.log.info(`Creating ${this.fullPath()}`)

    fs.writeFile(this.fullPath(), '', () => this.initWatch())
  }

  toJSON () {
    let cleanBase = this.base.split('/').slice(2).join('/')
    let url = Path.join('/folder', cleanBase, this.name)
    let download = '/dl/' + Crypto.Rabbit.encrypt(Path.join(cleanBase, this.name), config.server.masterKey).toString()
    let path = this.relativePath()
    return {
      name: this.name,
      type: this.type,
      mtime: this.mtime,
      locked: this.locked,
      downloadCount: this.downloadCount,
      size: this.size(),
      childs: this.childs,
      url,
      download: this instanceof Folder ? null : download,
      path: this instanceof Folder ? path : null
    }
  }

  download (res) {
    return new Promise((resolve, reject) => {
      this.addDownloader()
      res.download(this.fullPath(), (err) => {
        if (err) this.log.error(err)

        this.removeDownloader()

        resolve(err)
      })
    })
  }
}

function parsePath (path) {
  let temp = path.split('/')

  removeBlank(temp, 1)

  let name = temp.splice(temp.length - 1, 1)[0]
  return { fileName: name, path: temp.join('/') }
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

export { removeBlank, parsePath }
