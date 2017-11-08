import morgan from 'morgan'

module.exports = (app) => {
  morgan.token('remote-ip', function (req, res) { return req.headers['x-forwarded-for'] || req.connection.remoteAddress })
  morgan.token('user', function (req, res) { return req.user.username || 'Anonymous' })
  app.use(morgan('[:date[web]] :user@:remote-ip - :method :url - :status :response-time[digits]ms'))
}
