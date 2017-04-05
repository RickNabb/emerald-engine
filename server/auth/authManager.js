/**
* authManager.js
* A file to serve as a master manager for all authentication
* functions the app will perform..
*/

module.exports = (engine, db, fs, promise) => {

  let uuid = require('tiny-uuid4')
  // let mailer = require(__dirname + '/../utils/mailer.js')
  let bcrypt = require('bcrypt')

  const RESPONSE_OK = 0
  const RESPONSE_INVALID_LOGIN = 1
  const RESPONSE_UNKNOWN_ERROR = 2
  const RESPONSE_SERVER_UPDATING = 3
  const RESPONSE_USERNAME_TAKEN = 4
  const RESPONSE_ACCOUNT_CREATED = 5
  const RESPONSE_PASSWORD_CHANGED = 6
  const RESPONSE_LOGGED_IN = 7
  const saltRounds = 10;

  return {
    "authenticate": authenticate,
    "createUser": createUser,
    "RESPONSE_OK": RESPONSE_OK,
    "RESPONSE_INVALID_LOGIN": RESPONSE_INVALID_LOGIN,
    "RESPONSE_UNKNOWN_ERROR": RESPONSE_UNKNOWN_ERROR,
    "RESPONSE_SERVER_UPDATING": RESPONSE_SERVER_UPDATING,
    "RESPONSE_USERNAME_TAKEN": RESPONSE_USERNAME_TAKEN,
    "RESPONSE_ACCOUNT_CREATED": RESPONSE_ACCOUNT_CREATED,
    "RESPONSE_PASSWORD_CHANGED": RESPONSE_PASSWORD_CHANGED,
    "RESPONSE_LOGGED_IN": RESPONSE_LOGGED_IN
  }

  /**
   * Authenticate the user into the application
   * @param  {string} username The username
   * @param  {string} password The plaintext password
   * @return {object}          The result array with the response code
   * and potential user data.
   */
  function authenticate (email, password) {
    return new Promise(async (resolve, reject) => {
      let compRes
      let result = await db.mysql.queryPromise(
        "SELECT * FROM `user` WHERE `email`=?",
        [ email ]
      ).catch(err => reject(err))
      if (result[0]) {
        compRes = await checkPassword(password, result[0].password_hash)
          .catch(err => reject(err))
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
      } else {
        result = []
        result[0].loginResponse = RESPONSE_INVALID_LOGIN
      }
      resolve(result)
    })
  }

  function createUser(email, password) {
    return new Promise(async (resolve, reject) => {
      let hashedPass = await bcrypt.hash(password, saltRounds)
      let confirmationUUID = uuid()
      let doManager = engine.dataObjectManager
      let user = await doManager.dataObjects.user.createUser(
        email,
        hashedPass,
        0,
        confirmationUUID)
      .catch (err => reject(err))
      resolve(user)
    })
  }

  /**
   * Confirm a user's account.
   * @author Nick Rabb <nrabb@outlook.com>
   * @param {string} plaintext - The user's plaintext password
   * @param {string} hashed - The DB's hashed password
   * @param {function} callback - Code to run with the result.
   */
  function checkPassword (plaintext, hashed) {
    return new Promise(async (resolve, reject) => {
      let res = await bcrypt.compare(plaintext, hashed)
        .catch(err => reject(err))
      resolve(res)
    })
  }
}
