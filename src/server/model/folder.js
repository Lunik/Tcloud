import fs from 'fs-extra'

import File, { removeBlank } from './file'

export default class Folder extends File {
  constructor (path, base) {
    super(path, base)
    this.type = 'folder'
    this.childs = []
    if (this.exist) {
      this.initFolder()
    }

    this.idle = {
      date: new Date(),
      timeout: 1000
    }
  }

  initManualWatch (timeout) {
    setInterval(() => {
      this.watchChange(null, null)
    }, timeout)
  }

  initFolder () {
    var oldChilds = this.childs
    var newChilds = []
    var childs = []
    try {
      childs = fs.readdirSync(this.fullPath())
    } catch (err) {
      this.exist = false
    }

    for (let i = 0; i < childs.length; i++) {
      let stats = fs.statSync(`${this.fullPath()}/${childs[i]}`)
      let child
      if (stats.isFile()) {
        child = new File(`${this.fullPath()}/${childs[i]}`, `${this.base}/${this.name}`)
      } else if (stats.isDirectory()) {
        child = new Folder(`${this.fullPath()}/${childs[i]}`, `${this.base}/${this.name}`)
      } else {
        continue
      }

      let index = oldChilds.findIndex((oldchild) => oldchild.name === child.name)
      if (index !== -1) {
        oldChilds[index]._size = child._size
        newChilds.push(oldChilds[index])
      } else {
        child.on('change', () => this.emit('change'))
        child.on('startDownload', () => this.emit('change'))
        child.on('finishDownload', () => this.emit('change'))
        child.on('locked', () => this.emit('change'))
        child.on('unlocked', () => this.emit('change'))
        newChilds.push(child)
      }
    }

    this.childs = newChilds
  }

  watchChange (eventType, filename) {
    this.updateMetadata()
    if (new Date() - this.idle.date >= this.idle.timeout) {
      this.idle.date = new Date()
      this.initFolder()
      this.emit('change')
    }
  }

  handleChildRemove (child) {
    for (let i = 0; i < this.childs.length; i++) {
      if (this.childs[i].name === child.name) {
        this.childs.splice(i, 1)
        break
      }
    }
  }

  remove () {
    this.log.info(`Removing ${this.fullPath()}`)

    fs.remove(this.fullPath(), () => this.emit('remove', this))
  }

  size () {
    var size = this._size
    for (let i = 0; i < this.childs.length; i++) {
      size += this.childs[i].size()
    }

    return size // Bytes
  }

  create () {
    this.log.info(`Creating ${this.fullPath()}`)

    fs.mkdirSync(this.fullPath())
    this.exist = true

    this.initWatch()
  }

  addChild (child) {
    this.childs.push(child)
  }

  findChild (name) {
    for (let i = 0; i < this.childs.length; i++) {
      if (this.childs[i].name === name) {
        return this.childs[i]
      }
    }
    return null
  }
}

function follow (path, folder) {
  var current = folder
  var path = path.split('/')
  removeBlank(path, 0)

  let i = 0
  while (current instanceof Folder && i < path.length) {
    current = current.findChild(path[i])
    i++
  }

  if (i < path.length - 1) {
    return null // Path do not exist
  } else {
    return current
  }
}

export { follow }
