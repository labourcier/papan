'use strict'

const PapanUtils = require('./src/common/utils.js')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))

if (PapanUtils.isElectron()) {
  const mainElectron = require('./src/server/main-electron.js')
  mainElectron.main()
}

const mainNode = require('./src/server/main-node.js')
mainNode.main()

function readJSON (filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      resolve(err ? undefined : JSON.parse(data))
    })
  })
}

if (argv.auth_server) {
  Promise.all([
    readJSON('config/google-auth-config.json'),
    readJSON('config/facebook-auth-config.json'),
    readJSON('config/twitter-auth-config.json'),
    readJSON('config/steam-auth-config.json'),
    readJSON('config/pg-config.json'),
    readJSON('config/http-config.json')
  ]).then(values => {
    const config = {
      googleAuthConfig: values[0],
      facebookAuthConfig: values[1],
      twitterAuthConfig: values[2],
      steamAuthConfig: values[3],
      pgConfig: values[4],
      httpConfig: values[5]
    }
    const express = require('express')
    const papanAuth = require('./src/server/auth/server.js')
    let app = express()
    papanAuth.registerServer(app, config)
      .then(() => {
        console.log('Starting Auth server...')
        app.listen(8081)
      }).catch(err => {
        console.log('Not starting Auth server:')
        console.log(err)
      }
    )
  })
}
