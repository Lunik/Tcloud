import Config from '../model/config'
import Folder, { follow } from '../model/folder'
import File, { parsePath } from '../model/file'

const config = new Config({sync: true})

var baseFolder = new Folder(`/${__dirname}/${config.files.path}`, '')

if (!baseFolder.exist) {
  baseFolder.create()
  baseFolder.initManualWatch(30000)
}

function broadcastChange (io, folder) {
  io.emit('folder', folder)
}

module.exports = (app) => {
  baseFolder.on('change', () => broadcastChange(app.io, baseFolder))
  if (app.ioSSL) {
    baseFolder.on('change', () => broadcastChange(app.ioSSL, baseFolder))
  }

  app.get('/folder', (req, res) => {
    res.header('Cache-Control', 'no-cache')
    res.json(baseFolder)
  })

  app.get('/folder/:path((*)/?*)', (req, res) => {
    var path = req.params.path
    var element = follow(path, baseFolder)

    res.header('Cache-Control', 'no-cache')
    if (element) {
      res.json(element)
    } else {
      res.status(404)
      res.json({
        err: `${path} do not exist.`
      })
    }
  })

  app.put('/folder/:path((*)/?*)', (req, res) => {
    var path = req.params.path
    var type = req.body.type || 'folder'

    var parsedPath = parsePath(path)

    var element = follow(parsedPath.path, baseFolder)

    if (element) {
      if (element instanceof Folder) {
        if (!element.findChild(parsedPath.fileName)) {
          var newElement
          switch (req.body.type) {
            case 'file':
              newElement = new File(`${baseFolder.fullPath()}/${parsedPath.path}/${parsedPath.fileName}`, parsedPath.path)
              break
            case 'folder':
            default:
              newElement = new Folder(`${baseFolder.fullPath()}/${parsedPath.path}/${parsedPath.fileName}`, parsedPath.path)
              break
          }
          newElement.create()
          element.addChild(newElement)

          res.json(newElement)
        } else {
          res.status(403)
          res.json({
            err: `You can't create ${path} because it already exist.`
          })
        }
      } else {
        res.status(400)
        res.json({
          err: `You can't create ${path}, ${parsedPath.path} is not a folder.`
        })
      }
    } else {
      res.status(404)
      res.json({
        err: `You can't create ${path}, ${parsedPath.path} do not exist.`
      })
    }
  })

  app.post('/folder/:path((*)/?*)/rename', (req, res) => {
    var path = req.params.path
    var newName = req.body.new.replace(/[^\w\s._-]/gi, '-')
    var element = follow(path, baseFolder)

    if (element) {
      if (newName) {
        element.rename(newName)
        res.json(element)
      } else {
        res.status(400)
        res.json({
          err: 'Missing new name.'
        })
      }
    } else {
      res.status(404)
      res.json({
        err: `${path} do not exist.`
      })
    }
  })

  app.delete('/folder/:path((*)/?*)', (req, res) => {
    var path = req.params.path

    var element = follow(path, baseFolder)

    if (element) {
      element.remove()
      res.json(element)
    } else {
      res.status(404)
      res.json({
        err: `${path} do not exist.`
      })
    }
  })

  return baseFolder
}
