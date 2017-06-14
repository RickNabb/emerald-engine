/**
* getGuides.js
* The get guides packet.
* This packet should be used to attempt to create a user account.
*/

module.exports = (engine) => {

  /**
   * An ID to ensure modules loading this packet can get context
   * of what packet it is.
   */
  const id = 'getGuides'

  /**
   * handlePacket - Handle the get guides packet on the server side.
   *
   * @param  {object} data The incoming guide fetch request data:
   * { firstName: string, lastName: string, rating: Number, location: string }
   */
  async function handlePacket (data) {
    let guides = engine.guideManager.getGuides(data.firstName, data.lastName, data.rating, data.location)
    // engine.packetManager.send(engine.packetManager.packets.server.out.createAccountResponse, result)
  }

  return {
    "handlePacket": handlePacket,
    "id": id
  }
}
