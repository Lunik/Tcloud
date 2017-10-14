import SocketIO from 'socket.io'
import Cookie from 'cookie'

import Config from '../model/config'
import User from '../model/user'

var config = new Config({sync: true})

function authorization (data, accept) {
  var cookies = Cookie.parse(data.headers.cookie)
  let user = new User({ username: cookies.username || '' })

  user.on('ready', () => {
    let valid = user.isTokenValid(cookies.token || '')

    accept(valid ? null : 'Token not valid', valid)
  })
}

module.exports = (app, server) => {
  if (config.server.https) {
    app.ioSSL = SocketIO(server.serverSSL)
    app.ioSSL.set('authorization', authorization)
  }
  app.io = SocketIO(server.server)

  app.io.set('authorization', authorization)
}
