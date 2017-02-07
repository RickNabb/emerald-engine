/**
* connection.js
* The connection packet incoming from the client.
*/

module.exports = (engine, fs) => {
  return new Promise(async (resolve, reject) => {
    let _engine = engine
    // TODO : Check for rejection
    await onConnect().then(packets => resolve(packets))

    async function onConnect () {
      return new Promise((resolve, reject) => {
        _engine.io.on('connection', async (socket) => {
          console.log('A user connected')
          await registerPackets(socket).then(packets => resolve(packets))
        })
      })
    }

    /**
     * registerPackets - Register packets in the /packets/* directories
     * so they can be accessed through this manager in the future.
     * They are stored in the packets dictionary.
     */
    function registerPackets (socket) {
      return new Promise((resolve, reject) => {
        let packets = []
        let file, i, packet
        fs.readdir(__dirname, async (err, files) => {
          if (err) return reject(err)
          // Create a packet receipt for each packet in the /packets/in dir
          for (i = 0; i < files.length; i++) {
            file = files[i]
            if (file !== 'packetManager.js' && file !== 'connection.js') {
              packet = await getPacketFromName(file)
              if (packet !== null) {
                // Ensure the packet has the required shared methods
                if (packet.handlePacket) {
                  socket.on(
                    file.replace('.js', ''),
                    packet.handlePacket)
                  packets[file.replace('.js', '')] = packet

                  // Debugging
                  // engine.debug.log('Registered incoming packet ' + file)
                }
                else {
                  engine.debug.error('Could not register incoming packet ' + file + '... missing handlePacket() method')
                }
              }
            }
          }
          resolve(packets)
        })
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
            resolve(require('./' + packetName))
          }
          else if (err.code === 'ENOENT') {
            engine.debug.error("Trying to register packet " + packetName + " - couldn't find file in /shared/packets/")
          }
          else {
            engine.debug.error("Trying to register packet " + packetName + " - couldn't find file in /shared/packets/")
          }
        })
      })
    }
  })
}
