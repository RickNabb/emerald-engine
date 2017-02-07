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
 * The file system module.s
 */
let fs = require('fs')

/**
 * A custom debugging framework for the application.
 */
let debug = require('./utils/debug.js')

/**
 * The main server engine/
 */
let engine = require('./engine.js')(io, debug)

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
  await require('./packetManager.js')(engine, fs)
    .then(_packetManager => packetManager = _packetManager)
  setupRoutes()
}

/**
 * setupRoutes - Set up the routes that the client can use
 */
function setupRoutes() {
  let packet
  // Root
  app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../client/index.html'))
  })
  app.get('/api/packets', function (req, res) {
    res.json(Object.keys(packetManager.packets))
  })
}

init()
