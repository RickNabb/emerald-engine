/**
* login.js
* The login packet.
* This packet should be used to attempt to authenticate the user into
* the application.
*/

module.exports = (engine) => {

  /**
   * An ID to ensure modules loading this packet can get context
   * of what packet it is.
   */
  const id = 'login'

  /**
   * handlePacket - Handle the ping packet on the server side.
   *
   * @param  {object} socket Our connection to the SocketIO module.
   */
  async function handlePacket (data) {
    let authResult = await engine.authManager.authenticate(data['email'], data['password']).catch(err => console.log(err))
    engine.packetManager.send(engine.packetManager.packets.server.out.loginResponse, authResult)
    // switch (authResult[0].loginResponse) {
    //   case (engine.authManager.RESPONSE_OK): {
    //     console.log('login ok')
    //     break;
    //   }
    //   case (engine.authManager.RESPONSE_INVALID_LOGIN): {
    //
    //     break;
    //   }
    //   default: {
    //     break;
    //   }
    // }
  }

  return {
    "handlePacket": handlePacket,
    "id": id
  }
}
