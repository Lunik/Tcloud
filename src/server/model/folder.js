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
  }

  initManualWatch (timeout) {
    setInterval(() => {
      this.initMetadata()
      this.initFolder()
    }, timeout)
  }

  initFolder () {
    this.childs = []
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

      this.addChild(child)
    }
  }

  watchChange (eventType, filename) {
    this.initMetadata()
    this.initFolder()
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

    fs.removeSync(this.fullPath())
    this.emit('remove', this)
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
