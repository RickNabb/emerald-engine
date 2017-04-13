/**
* connection.js
* The connection packet incoming from the client.
*/

module.exports = (engine, fs, promise) => {
  return new Promise(async (resolve, reject) => {
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
      return new Promise(async (resolve, reject) => {
        let _packets
        engine.io.on('connection', (socket) => {
          engine.debug.log('A user connected')
          initSocket(socket)
        })
        _packets = await registerPackets()
        await generatePacketManifest(_packets)
        resolve(_packets)
      })
    }

    /**
     * Generate a packet manifest JSON file to serve up
     * to the client.
     * @param  {object} packets Associative array of all of our client
     * and server packets.
     * @return {Promise} resolves to nothing
     */
    function generatePacketManifest(packets) {
      return new Promise((resolve, reject) => {
        fs.writeFile(__dirname + '/../../manifest.json', JSON.stringify(packets), 'utf8', (err) => {
          if (err) reject(err)
          resolve()
        })
      })
    }

    /**
     * Initialize a new socket connection by registering all
     * the packets the application will need to handle.
     * @param  {object} socket The SocketIO instance
     */
    function initSocket(socket) {
      let packet
      for (packet in packets.server.in) {
        socket.on(packet, packets.server.in[packet].handlePacket)
      }
      // for (packet in packets.server.out) {
      //   socket.on(packet, packets.server.out[packet].handlePacket)
      // }
    }

    /**
     * Register packets in the /packets/* directories
     * so they can be accessed through this manager in the future.
     * They are stored in the packets dictionary.
     */
    function registerPackets () {
      return new Promise(async (resolve, reject) => {
        let _packets = {client: {"in": [], "out": []},
                        server: {"in": {}, "out": {}}}
        let promises = []
        promises.push(registerServerPackets(_packets.server.out, __dirname + "/../out"))
        promises.push(registerServerPackets(_packets.server.in, __dirname))
        promises.push(registerClientPackets(_packets.client.in, __dirname + '/../../client/in'))
        promises.push(registerClientPackets(_packets.client.out, __dirname + '/../../client/out'))
        await Promise.all(promises)
          .catch(err => engine.debug.error(err))
        resolve(_packets)
      })
    }

    /**
     * Register all of the client packets with the socket.
     * @param  {object} container Either the packets.client.in or
     * packets.client.out object.
     * @param  {string} dir       The directory to search for client packets
     * in.
     */
    function registerClientPackets(container, dir) {
      return new Promise(async (resolve, reject) => {
        let files, file, index
        files = await readdir_promise(dir)
        for (index in files) {
          file = files[index]
          container.push(file.replace('.js', ''))

          // Debugging
          // engine.debug.log('Registered client packet ' + file)
        }
        resolve()
      })
    }

    /**
     * Register all of the server packets with the socket.
     * @param  {object} container Either the packets.server.in or
     * packets.server.out object.
     * @param  {string} dir       The directory to search for server packets
     * in.
     */
    function registerServerPackets (container, dir) {
      return new Promise(async (resolve, reject) => {
        let files, file, index, packet
        files = await readdir_promise(dir)
        for (index in files) {
          file = files[index]
          if (file !== 'connection.js') {
            packet = await getPacketFromName(dir, file)
            if (packet !== null) {
              // Ensure the packet has the required shared methods
              if (packet.handlePacket || packet.send) {
                container[file.replace('.js', '')] = packet

                // Debugging
                engine.debug.log('Registered server packet ' + file)
              }
              else {
                reject('Could not register incoming packet '
                 + file + '... missing both handlePacket() or send() methods')
              }
            }
          }
        }
        resolve()
      })
    }

    /**
     * Get a packet module by its filename.
     * @param  {string} dir       The dir to look in
     * @param  {string} packetName The name of the packet to fetch.
     */
    function getPacketFromName (dir, packetName) {
      return new Promise((resolve, reject) => {
        let path = dir + '/' + packetName
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
