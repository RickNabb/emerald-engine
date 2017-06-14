/**
* guideManager.js
* A file to serve as a master manager for all guide user
* functions the app will perform.
*/

module.exports = (engine, db, fs, promise) => {

  /**
   * Get guides
   * @param  {string} firstName The first name of guides to search.
   * @param  {string} lastName  The last name of guides to search.
   * @param  {Number} rating    The rating to select by.
   * @param  {string} location  The guides' location to select by.
   * @return {type}           description
   */
  function getGuides(firstName, lastName, rating, location) {
    let query = 'SELECT * FROM guides WHERE '
    let queryParams = []
    if (firstName !== null || firstName !== undefined) {
      query += '`firstName`=? AND '
      queryParams.push(firstName)
    } else if (lastName !== null || lastName !== undefined) {
      query += '`lastName`=? AND'
      queryParams.push(lastName)
    } else if (rating !== null || rating !== undefined) {
      query += '`rating`=? AND'
      queryParams.push(rating)
    } else if (location !== null || location !== undefined) {
      query += '`location`=? AND'
      queryParams.push(location)
    }
    query = query.substring(0, query.length - 4)
    let result = await engine.db.mysql.queryPromise(
      query,
      queryParams
    )
  }

  return {
    "getGuides": getGuides
  }
}
