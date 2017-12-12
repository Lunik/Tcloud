const template = {
  'log': {
    'path': 'logs/'
  },
  'server': {
    'port': 5000,
    'masterKey': 'mymasterkey',
    'https': false,
    'hostname': '',
    'certs': {
      'privatekey': '',
      'certificate': '',
      'chain': ''
    }
  },
  'database': {
    'path': 'database/'
  },
  'authentification': false,
  'registration': true,
  'files': {
    'path': 'files/',
    'tmp': '.tmp/'
  },
  'torrent': {
    'providers': []
  }
}

module.exports = template

if (__filename.match(/.*template.*/g)) {
  console.log(JSON.stringify(template, 'undefined', 2))
}
