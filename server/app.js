/**
* index.js
* The server implementation for the SocketIO test app.
* This is the main point of entry.
*/

/**
 * The ExpressJS module to set up routing for the client side of the app.
 */
let express = require('express')
let app = express()

/**
 * The HTTP module for routing.
 */
let http = require('http').Server(app)

/**
 * The socketIO module for handling app communications.
 */
let io = require('socket.io')(http)

/**
 * The path module for resolving filepaths.
 */
let path = require('path')

/**
 * The file system module.
 */
let fs = require('fs')

/**
 * The module we can use to convert async Node FUNCTIONS
 * into those using promises.
 */
let promise = require('promise')

/**
 * A custom debugging framework for the application.
 */
let debug = require('./utils/debug.js')

/**
 * The database module.
 */
let db = require('./db/databaseManager.js')(fs)

/**
 * The main server engine/
 */
let engine = require('./engine.js')(io, debug, db)

/**
 * The packet manager to handle transactions between client and server.
 */
let packetManager

/**
 * The port to listen on.
 */
let port = 3000

/**
 * init - The initialization method.
 * Modules that load asynchronously are loaded here as well.
 */
async function init() {
  debug.log('Socket IO Test Server Started...')
  app.use(express.static('client'))
  process.on('uncaughtException', (exception) => {
    debug.error(exception, true)
    process.exit()
  })
  http.listen(port, function() {
    debug.log("Listening on *:3000...")
  })
  packetManager = await require('./packetManager.js')(engine, fs, promise)
  setupRoutes()
}

/**
 * setupRoutes - Set up the routes that the client can use
 */
function setupRoutes() {
  let index, packet
  // Root
  app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../client/index.html'))
  })
  // Publish a list of packets and each packet
  app.get('/api/packets/client', function (req, res) {
    res.json(packetManager.packets.client)
  })
  for (index in packetManager.packets.client) {
    packet = packetManager.packets.client[index]
    app.get('/api/packets/client/' + packet + '.js', function (req, res) {
      res.sendFile(path.resolve(__dirname + "/../shared/packets/client/" + packet + ".js"))
    })
  }
  app.get('/api/packets/server', function (req, res) {
    res.json(Object.keys(packetManager.packets.server))
  })
  for (index in Object.keys(packetManager.packets.server)) {
    packet = Object.keys(packetManager.packets.server)[index]
    app.get('/api/packets/server/' + packet + ".js", function (req, res) {
      res.sendFile(path.resolve(__dirname + "/../shared/packets/server/" + packet + ".js"))
    })
  }
}

init()
