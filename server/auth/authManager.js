/**
* authManager.js
* A file to serve as a master manager for all authentication
* functions the app will perform..
*/

module.exports = (engine, db, fs, promise) => {

  let bcrypt = require('bcrypt-nodejs');
  let uuid = require('tiny-uuid4');
  let mailer = require(__dirname + '/../utils/mailer.js');
  
  let RESPONSE_OK = 0;
  let RESPONSE_INVALID_LOGIN = 1;
  let RESPONSE_UNKNOWN_ERROR = 2;
  let RESPONSE_SERVER_UPDATING = 3;
  let RESPONSE_USERNAME_TAKEN = 4;
  let RESPONSE_ACCOUNT_CREATED = 5;
  let RESPONSE_PASSWORD_CHANGED = 6;
  let RESPONSE_LOGGED_IN = 7;

  /**
   * Authenticate the user into the application
   * @param  {string} username The username
   * @param  {string} password The plaintext password
   * @return {object}          The result array with the response code
   * and potential user data.
   */
  async function authenticate (username, password) {
    let result = await db.mysql.queryPromise(
      "SELECT * FROM `users` WHERE `username`=?",
      [ username ]
    )
    if (result[0]) {
      try {
        compRes = await checkPassword(password, result[0].password_hash)
        if (compRes) {
          engine.debug.log("Login OK")
          delete result[0].password_hash
          delete result[0].confirmation_uuid
          result[0].loginResponse = RESPONSE_OK
        } else {
          engine.debug.log("Login bad")
          delete result[0].password_hash
          delete result[0].confirmation_uuid
          result[0].loginResponse = RESPONSE_INVALID_LOGIN
        }
      } catch (err) {
        engine.debug.error(err)
      }
    } else {
      result = []
      result[0].loginResponse = RESPONSE_INVALID_LOGIN
    }
    return result
  }

  /**
   * Confirm a user's account.
   * @author Nick Rabb <nrabb@outlook.com>
   * @param {string} plaintext - The user's plaintext password
   * @param {string} hashed - The DB's hashed password
   * @param {function} callback - Code to run with the result.
   */
  function checkPassword (plaintext, hashed, callback) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plaintext, hashed, function (err, compRes) {
        if (err) reject(err)
        resolve(compRes)
      });
    })
  }

}
