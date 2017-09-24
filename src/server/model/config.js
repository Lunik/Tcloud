import fs from 'fs'
import Delogger from 'delogger'
import EventEmitter from 'events'
import { expect } from 'chai'

import template from './config.template'

export const ConfigLocation = `config.json`

export default class Config extends EventEmitter {
  constructor (props) {
    super()
    props = props || {}
    this.location = process.env.CONFIG_PATH || ConfigLocation
    this.log = new Delogger('Config')

    let config
    if (props.sync) {
      try {
        var data = fs.readFileSync(this.location)
        config = this.parseConfig(data)
        this.assignConfig(config)
      } catch (err) {
        if (err.code === 'ENOENT') {
          this.generateConfig()
        } else {
          this.log.error(err)
        }
      }
    } else {
      fs.readFile(this.location, (err, data) => {
        if (err && err.code === 'ENOENT') {
          this.generateConfig()
        } else if (!err) {
          config = this.parseConfig(data)
          this.assignConfig(config)
        } else {
          this.log.error(err)
        }
      })
    }
  }

  generateConfig () {
    this.assignConfig(template)

    fs.writeFile(this.location, JSON.stringify(template, 'undefined', 2), (err) => {
      if (err) {
        this.log.error(err)
      }
    })
  }

  parseConfig (string) {
    let config = JSON.parse(string)

    expect(config).to.have.property('log').to.be.a('object')
    expect(config.log).to.have.property('path').to.be.a('string').not.empty

    expect(config).to.have.property('server').to.be.a('object')
    expect(config.server).to.have.property('port').to.be.a('number').within(0, 65535)
    expect(config.server).to.have.property('masterKey').to.be.a('string').to.have.lengthOf.above(5)
    expect(config.server).to.have.property('https')

    if (config.server.https) {
      expect(config.server.https).to.be.a('number')
      expect(config.server).to.have.property('hostname').to.be.a('string').not.empty

      expect(config.server).to.have.property('certs').to.be.a('object')
      expect(config.server.certs).to.have.property('privatekey').to.be.a('string').not.empty
      expect(config.server.certs).to.have.property('certificate').to.be.a('string').not.empty
      expect(config.server.certs).to.have.property('chain').to.be.a('string').not.empty
    } else {
      expect(config.server.https).to.be.a('boolean')
    }

    expect(config).to.have.property('database').to.be.a('object')
    expect(config.database).to.have.property('path').to.be.a('string').not.empty

    expect(config).to.have.property('authentification').to.be.a('boolean')
    expect(config).to.have.property('registration').to.be.a('boolean')

    expect(config).to.have.property('files').to.be.a('object')
    expect(config.files).to.have.property('path').to.be.a('string').not.empty

    expect(config).to.have.property('torrent').to.be.a('object')
    expect(config.torrent).to.have.property('providers').to.be.a('array')

    return config
  }

  assignConfig (config) {
    config.server.port = parseInt(process.env.PORT) || config.server.port
    config.torrent.providers = process.env.TORRENT_PROVIDERS.split(',') || config.torrent.providers
    Object.assign(this, config)

    this.emit('ready')
  }
}
