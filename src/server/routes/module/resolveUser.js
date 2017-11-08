import User from '../../model/user'

export default function () {
  return (req, res, next) => {
    if (req.body.username || req.cookies.username) {
      let user = new User({username: req.body.username || req.cookies.username})
      user.on('ready', () => {
        req.user = user
        next()
      })
    } else {
      req.user = new User()
      next()
    }
  }
}
