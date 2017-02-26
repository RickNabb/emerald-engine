/**
* connection.js
* The connection packet incoming from the client.
*/

module.exports = (engine, fs, promise) => {
  return new Promise(async (resolve, reject) => {
    let _engine = engine
    let readdir_promise = promise.denodeify(fs.readdir)

    // TODO : Check for rejection
    let packets = await onConnect()
    resolve(packets)

    /**
     * onConnect - Code to run when the client connects to
     * the server.
     *
     * @return {object}  Resolve the packets object
     */
    function onConnect () {
      return new Promise((resolve, reject) => {
        _engine.io.on('connection', async (socket) => {
          console.log('A user connected')
          socket.on('ping', () => {console.log('ping')})
          let packets = await registerPackets(socket)
          resolve(packets)
        })
      })
    }

    /**
     * registerPackets - Register packets in the /packets/* directories
     * so they can be accessed through this manager in the future.
     * They are stored in the packets dictionary.
     */
    function registerPackets (socket) {
      return new Promise(async (resolve, reject) => {
        let packets = {client: [], server: {}}
        let index, file, packet, serverFiles, clientFiles
        // Read in server packets
        serverFiles = await readdir_promise(__dirname)
        for (index in serverFiles) {
          file = serverFiles[index]
          if (file !== 'connection.js') {
            packet = await getPacketFromName(file)
            if (packet !== null) {
              // Ensure the packet has the required shared methods
              if (packet.handlePacket || packet.send) {
                // socket.on(
                //   file.replace('.js', ''),
                //   () => {console.log('test')})
                // console.log('server on ' + file.replace('.js', '') + ' : ' + packet.handlePacket)
                packets.server[file.replace('.js', '')] = packet

                // Debugging
                // engine.debug.log('Registered server packet ' + file)
              }
              else {
                engine.debug.error('Could not register packet ' + file + '... missing both handlePacket() or send() methods')
              }
            }
          }
        }
        // Read in the client packets - only by name
        clientFiles = await readdir_promise(__dirname + '/../client/')
        for (index in clientFiles) {
          file = clientFiles[index]
          packets.client.push(file.replace('.js', ''))

          // Debugging
          // engine.debug.log('Registered client packet ' + file)
        }
        resolve(packets)
      })
    }

    /**
     * getPacketFromName - Get a packet module by its filename.
     *
     * @param  {string} packetName The name of the packet to fetch.
     */
    function getPacketFromName (packetName) {
      return new Promise((resolve, reject) => {
        let path = __dirname + '/' + packetName
        fs.stat(path, (err, stat) => {
          if (err === null) {
            resolve(require(path))
          }
          else if (err.code === 'ENOENT') {
            engine.debug.error("Trying to register packet " + packetName + " - couldn't find file in " + __dirname)
          }
          else {
            engine.debug.error("Trying to register packet " + packetName + " - couldn't find file in " + __dirname)
          }
        })
      })
    }
  })
}
