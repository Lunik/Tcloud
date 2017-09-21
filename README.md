# Tcloud

[![Greenkeeper badge](https://badges.greenkeeper.io/Lunik/tcloud.svg)](https://greenkeeper.io/)
[![npm](https://img.shields.io/npm/v/tcloud.svg)](https://www.npmjs.com/package/tcloud)
[![Travis branch](https://img.shields.io/travis/Lunik/tcloud/master.svg)](https://travis-ci.org/Lunik/tcloud)
[![Dependency Status](https://gemnasium.com/badges/github.com/Lunik/tcloud.svg)](https://gemnasium.com/github.com/Lunik/tcloud)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## ===== View =====

![App-view](https://i.imgur.com/BsmiKID.png)

## ===== Installation =====

## Standalone

Get the last release from https://github.com/Lunik/tcloud/releases
```
$ wget https://github.com/Lunik/tcloud/releases/download/v0.2.6/tcloud-v0.2.6.tgz
```

Uncompress the tarball and cd into
```
$ tar zxf tcloud-v0.2.6.tgz
$ cd tcloud-v0.2.6
```

Install dependencies
```
$ npm install --production
```

### Run
```
$ node server.js
```

## Docker
[![Docker Stars](https://img.shields.io/docker/stars/lunik/tcloud.svg)](https://hub.docker.com/r/lunik/tcloud/)
[![Docker Pulls](https://img.shields.io/docker/pulls/lunik/tcloud.svg)](https://hub.docker.com/r/lunik/tcloud/)
[![](https://images.microbadger.com/badges/image/lunik/tcloud.svg)](https://microbadger.com/images/lunik/tcloud "Get your own image badge on microbadger.com")

```
$ docker pull lunik/tcloud
$ docker run -d \
    -v /some/folder/files:/usr/src/app/files \
    -v /some/folder/config:/usr/config \
    -v /some/folder/database:/usr/src/app/database \
    lunik/tcloud:latest
```

## Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Lunik/tcloud)
/!\ Heroku don't store any data. Once your app shutdown, you will loose all your login and your files.
To prevent that you can use [kaffeine](http://kaffeine.herokuapp.com/) to keep your app UP 24/24.

## ===== Configuration =====
Modify `config.json`.
On the first installation, this file could be missing, run `npm run build` to generate a default one.

## ===== Notes =====
If you want to download large torrent, check your server memory. If the torrent is larger that your memorie, it could fail with allocation error. You can add swap to your server to prevent this issue.
It comes from webtorrent [issue](https://github.com/webtorrent/webtorrent/issues/1186).