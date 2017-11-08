import Crypto from 'crypto-js'

import Config from '../model/config'

const config = new Config({sync: true})
const loginPage = '/login.html'

module.exports = (app) => {
  // Check authentification
  app.use((req, res, next) => {
    var user = req.user
    if (req.url.match(/\/(auth|src|dl|app)\/.*/g) ||
        req.url.match(/manifest\.json/g) ||
      !config.authentification) {
      next()
    } else {
      const validToken = user.isTokenValid(req.cookies.token)
      // Is the user on login page
      if (req.url === loginPage) {
        // Is the user logged in
        if (validToken) {
          res.redirect('/')
        } else {
          next()
        }
      } else {
        // Is the user logged in
        if (validToken) {
          next()
        } else {
          res.redirect(loginPage)
        }
      }
    }
  })

  app.post('/auth/login', (req, res) => {
    var user = req.user
    const formData = {
      username: req.body.username || req.cookies.username,
      password: req.body.password,
      staylogged: req.body.staylogged || false
    }

    if (formData.username && formData.password) {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      if (user.isPasswordValid(formData.password)) {
        const token = user.login(ip, formData.staylogged)
        res.cookie('token', token.id, { expires: token.expirationDate, httpOnly: true, encode: String })
        res.cookie('username', user.username, { expires: token.expirationDate, httpOnly: true, encode: String })
        res.json({
          err: false,
          token: token.id
        })
      } else {
        res.status(401)
        res.json({
          err: 'Wrong User or Pass.'
        })
      }
    } else {
      res.status(400)
      res.json({
        err: 'Missing User or Pass.'
      })
    }
  })

  app.post('/auth/logout', (req, res) => {
    var user = req.user
    var formData = {
      username: req.body.username || req.cookies.username,
      token: req.body.token || req.cookies.token
    }
    if (formData.username && formData.token) {
      user.logout(formData.token)
      res.clearCookie('token')
      res.clearCookie('username')
      res.json({
        err: false
      })
    } else {
      res.status(400)
      res.json({
        err: 'Missing User or Token.'
      })
    }
  })

  app.post('/auth/register', (req, res) => {
    var user = req.user
    var formData = {
      username: req.body.username || req.cookies.username,
      password: req.body.password
    }
    if (formData.username && formData.password) {
      if (config.registration) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        user.exist((exist) => {
          if (!exist) {
            user.set({password: Crypto.SHA256(formData.password).toString(), username: formData.username})
            var token = user.login(ip, false)
            res.cookie('token', token.id, {expires: token.expirationDate, httpOnly: true, encode: String})
            res.cookie('username', user.username, {expires: token.expirationDate, httpOnly: true, encode: String})
            res.json({
              err: false,
              token: token.id
            })
          } else {
            res.status(409)
            res.json({
              err: 'User already exist.'
            })
          }
        })
      } else {
        res.status(403)
        res.json({
          err: 'Registration is disabled.'
        })
      }
    } else {
      res.status(400)
      res.json({
        err: 'Missing User or Password.'
      })
    }
  })

  app.post('/auth/changepass', (req, res) => {
    var user = req.user
    var formData = {
      username: req.body.username || req.cookies.username,
      oldPassword: req.body.oldpassword,
      newPassorwd: req.body.newpassword
    }

    if (formData.username && formData.oldPassword && formData.newPassorwd) {
      if (user.isPasswordValid(formData.oldPassword)) {
        user.set({ password: Crypto.SHA256(formData.newPassorwd).toString() })
        res.json({
          err: false
        })
      } else {
        res.status(403)
        res.json({
          err: 'Wrong User or Pass.'
        })
      }
    } else {
      res.status(400)
      res.json({
        err: 'Missing User, Pass or new Pass.'
      })
    }
  })

  app.get('/auth/logged', (req, res) => {
    var user = req.user
    var token = req.body.token || req.cookies.token
    res.json(user.isTokenValid(token))
  })
}
