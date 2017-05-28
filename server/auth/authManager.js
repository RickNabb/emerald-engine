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
          // engine.debug.log("Login OK")
          delete result[0].password_hash
          delete result[0].confirmation_uuid
          result = { "response": RESPONSE_OK, "user": result[0] }
        } else {
          // engine.debug.log("Login bad")
          delete result[0].password_hash
          delete result[0].confirmation_uuid
          result = { "response": RESPONSE_INVALID_LOGIN, "user": result[0] }
        }
      } else {
        result = { "response": RESPONSE_INVALID_LOGIN }
      }
      resolve(result)
    })
  }

  /**
   * Change the user's password if their old password matches their entry
   * in the database.
   * @param  {string} email       The user's email address.
   * @param  {string} oldPassword The user's old password.
   * @param  {string} newPassword The user's new password.
   * @return {object}             Resolve the promise to the user object
   * with the new password.
   */
  function changePassword(email, oldPassword, newPassword) {
    return new Promise(async (resolve, reject) => {
      let compRes, result, user, passHash
      result = await db.mysql.queryPromise(
        "SELECT * FROM `user` WHERE `email`=?",
        [ email ]
      ).catch(err => reject(err))
      if (result[0]) {
        compRes = await checkPassword(oldPassword, result[0].password_hash)
          .catch(err => reject(err))
        if (compRes) {
          passHash = await bcrypt.hash(newPassword, saltRounds)
          user = await engine.dataObjectManager.dataObjects.user.updateUser(
            result[0].id,
            email,
            passHash,
            result[0].active,
            result[0].confirmation_uuid
          ).catch(err => reject(err))
          delete result[0].password_hash
          delete result[0].confirmation_uuid
          result = { "response": RESPONSE_PASSWORD_CHANGED, "user": result[0] }
        } else {
          delete result[0].password_hash
          delete result[0].confirmation_uuid
          result = { "response": RESPONSE_INVALID_LOGIN, "user": result[0] }
        }
      } else {
        result = { "response": RESPONSE_INVALID_LOGIN }
      }
      resolve(result)
    })
  }

  /**
   * Create a new user account, first checking that the email has not been
   * registered already.
   * @param  {string} email    The user's email address.
   * @param  {string} password The user's plaintext password.
   * @return {object}          Promise resolving to a response, and a user
   * if the account was created successfully.
   */
  function createUserAccount(email, password) {
    return new Promise(async (resolve, reject) => {
      let queryResult
      // Make sure the user's email hasn't been used before
      queryResult = await db.mysql.queryPromise(
        'SELECT * FROM user WHERE `email`=?',
        [ email ]
      ).catch(err => reject(err))
      if (queryResult.length === 0)
        resolve(await createUser(email, password))
      else
        resolve({ "response": RESPONSE_USERNAME_TAKEN })
    })
  }

  /**
   * Create a new user in the database and return it to the promise.
   * @param  {string} email    The user's email address
   * @param  {string} password The user's password
   * @return {object}          The user object created.
   */
  function createUser(email, password) {
    return new Promise(async (resolve, reject) => {
      const hashedPass = await bcrypt.hash(password, saltRounds)
      const confirmationUUID = uuid()
      const doManager = engine.dataObjectManager
      const insertResult = await doManager.dataObjects.user.createUser(
        email,
        hashedPass,
        0,
        confirmationUUID)
      .catch (err => reject(err))
      const user = await doManager.dataObjects.user.getUser(insertResult.insertId)
      resolve({"response": RESPONSE_ACCOUNT_CREATED, "user": user[0]})
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

  return {
    "authenticate": authenticate,
    "createUser": createUser,
    "changePassword": changePassword,
    "createUserAccount": createUserAccount,
    "RESPONSE_OK": RESPONSE_OK,
    "RESPONSE_INVALID_LOGIN": RESPONSE_INVALID_LOGIN,
    "RESPONSE_UNKNOWN_ERROR": RESPONSE_UNKNOWN_ERROR,
    "RESPONSE_SERVER_UPDATING": RESPONSE_SERVER_UPDATING,
    "RESPONSE_USERNAME_TAKEN": RESPONSE_USERNAME_TAKEN,
    "RESPONSE_ACCOUNT_CREATED": RESPONSE_ACCOUNT_CREATED,
    "RESPONSE_PASSWORD_CHANGED": RESPONSE_PASSWORD_CHANGED,
    "RESPONSE_LOGGED_IN": RESPONSE_LOGGED_IN
  }
}
