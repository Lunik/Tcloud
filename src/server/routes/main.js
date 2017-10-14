import Express from 'express'
import Delogger from 'delogger'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import https from 'https'
import http from 'http'
import fs from 'fs'
import Path from 'path'
import morgan from 'morgan'

import EnforceHttps from './module/enforceHttps'
import Config from '../model/config'
var config = new Config({sync: true})

export default class Server {
  constructor () {
    this.app = Express()
    this.app.use(compression())
    this.app.use(cookieParser())
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({
      extended: true
    }))
    this.app.use(morgan('[:date[web]] :remote-addr - :method :url - :status :response-time[digits]ms'))

    if (config.server.https) {
      this.app.use(EnforceHttps({
        port: config.server.https
      }))

      let options = {}

      Object.assign(options, {
        hostname: config.server.hostname,
        key: fs.readFileSync(config.server.certs.privatekey),
        cert: fs.readFileSync(config.server.certs.certificate),
        ca: fs.readFileSync(config.server.certs.chain)
      })

      this.serverSSL = https.createServer(options, this.app)
    }

    this.server = http.createServer(this.app)

    require('./socket')(this.app, this)
    require('./auth')(this.app)
    this.baseFolder = require('./folder')(this.app)
    require('./file')(this.app, this.baseFolder)
    require('./torrent')(this.app, this.baseFolder)
    require('./app')(this.app, this.baseFolder)

    this.app.use(Express.static(Path.join(__dirname, '/public')))

    this.log = new Delogger('Server')
  }

  listen () {
    let host = '0.0.0.0'

    if (config.server.https) {
      // ssl server
      this.serverSSL.listen(config.server.https, host, () => this.log.info(`Server listening on ${host}:${config.server.https}`))
      this.app.socketSSL = this.app.ioSSL.listen(this.serverSSL, host)
    }

    // http server
    this.server.listen(config.server.port, host, () => this.log.info(`Server listening on ${host}:${config.server.port}`))
    this.app.socket = this.app.io.listen(this.server, host)
  }
}
