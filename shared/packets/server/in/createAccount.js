/**
* createAccount.js
* The login packet.
* This packet should be used to attempt to create a user account.
*/

module.exports = (engine) => {

  /**
   * An ID to ensure modules loading this packet can get context
   * of what packet it is.
   */
  const id = 'createAccount'

  /**
   * handlePacket - Handle the ping packet on the server side.
   *
   * @param  {object} socket Our connection to the SocketIO module.
   */
  async function handlePacket (data) {
    console.log(data)
    let user = await engine.authManager.createUser(data.email, data.password)
      .catch(err => console.log(err))
    // if (user)
    delete user.password_hash
    engine.packetManager.send(engine.packetManager.packets.server.out.createAccountResponse, user)
  }

  return {
    "handlePacket": handlePacket,
    "id": id
  }
}
