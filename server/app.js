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
 * The data object manager to handle reading in all of the data objects
 * and running any functions associated with them.
 */
let dataObjectManager

/**
 * The port to listen on.
 */
let port = 3000

/**
 * init - The initialization method.
 * Modules that load asynchronously are loaded here as well.
 */
async function init() {
  // Start the server
  debug.log('TravelMind Server Started...')
  app.use('/emerald', express.static(path.join(__dirname, '/../client/scripts')))
  app.use('/imports', express.static(path.join(__dirname, '/../../imports')))
  app.use('/css', express.static(path.join(__dirname, '/../../client/css')))
  app.use('/js', express.static(path.join(__dirname, '/../../client/js/build')))

  // TODO : Make sure we can get each CSS file from these static serve-ups

  // process.on('uncaughtException', (exception) => {
  //   debug.error(exception, true)
  //   process.exit()
  // })
  http.listen(port, function() {
    debug.log("Listening on *:" + port + "...")
  })
  db.init()

  // Start up all the managers
  dataObjectManager = await require('./dataObjectManager.js')(engine, db, fs, promise)
  packetManager = await require('./packetManager.js')(engine, fs, promise)
  setupRoutes()
}

/**
 * setupRoutes - Set up the routes that the client can use
 */
function setupRoutes() {
  let index, clientInPacket, clientOutPacket, serverInPacket, serverOutPacket
  // Root
  app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../../client/main.html'))
  })
  // Publish a list of packets and each packet
  app.get('/api/packets/client', function (req, res) {
    res.json(packetManager.packets.client)
  })
  for (index in packetManager.packets.client.in) {
    clientInPacket = packetManager.packets.client.in[index]
    app.get('/api/packets/client/in/' + clientInPacket + '.js', function (req, res) {
      res.sendFile(path.resolve(__dirname + "/../shared/packets/client/in/" + clientInPacket + ".js"))
    })
  }
  for (index in packetManager.packets.client.out) {
    clientOutPacket = packetManager.packets.client.out[index]
    app.get('/api/packets/client/out/' + clientOutPacket + '.js', function (req, res) {
      res.sendFile(path.resolve(__dirname + "/../shared/packets/client/out/" + clientOutPacket + ".js"))
    })
  }
  app.get('/api/packets/server', function (req, res) {
    res.json(Object.keys(packetManager.packets.server))
  })
  for (index in Object.keys(packetManager.packets.server.in)) {
    serverInPacket = Object.keys(packetManager.packets.server.in)[index]
    app.get('/api/packets/server/in/' + serverInPacket + ".js", function (req, res) {
      res.sendFile(path.resolve(__dirname + "/../shared/packets/server/in/" + serverInPacket + ".js"))
    })
  }
  for (index in Object.keys(packetManager.packets.server.out)) {
    serverOutPacket = Object.keys(packetManager.packets.server.out)[index]
    app.get('/api/packets/server/out/' + serverOutPacket + ".js", function (req, res) {
      res.sendFile(path.resolve(__dirname + "/../shared/packets/server/out/" + serverOutPacket + ".js"))
    })
  }
}

init()
