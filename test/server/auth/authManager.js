/**
* authManager.js
* The tests for the authentication manager.
*/

module.exports = (db, engine, fs, promise) => {

  let authManager = require(__dirname + '/../../../server/auth/authManager.js')(engine, db, fs, promise)
  const saltRounds = 10

  let tests = [
    prepareUser,
    authenticateUserValid,
    authenticateUserInvalid,
    changePassword
  ]

  async function run() {
    let res, i, test
    engine.debug.log("--- Starting Auth Manager Tests ---")
    for (i in tests) {
      test = tests[i]
      res = await test()
        .catch(err => engine.debug.error(err))
      if (res !== undefined) engine.debug.log(res)
    }
    engine.debug.log("--- Stopping Auth Manager Tests ---")
    engine.debug.log("Cleaning up...")
    res = 0
    res = await cleanUp()
      .catch(err => engine.debug.error(err))
    engine.debug.log('Cleaned up ' + res + ' row(s)')
  }

  function prepareUser() {
    return new Promise(async (resolve, reject) => {
      let user
      user = await authManager.createUser('testuser@test.com','testuserpassword')
        .catch(err => reject("Prepare User Test: FAILED (" + err + ")"))
      resolve("Prepare User Test: SUCCESS")
    })
  }

  function authenticateUserValid() {
    return new Promise(async (resolve, reject) => {
      let result
      result = await authManager.authenticate('testuser@test.com','testuserpassword')
        .catch(err => reject("Prepare User Test: FAILED (" + err + ")"))
      if (result[0].loginResponse === authManager.RESPONSE_OK)
        resolve("Authenticate User Valid Test: SUCCESS")
      else if (result[0].loginResponse === authManager.RESPONSE_INVALID_LOGIN)
        resolve("Authenticate User Valid Test: FAILED (valid login)")
      else
        resolve("Authenticate User Valid Test: FAILED (unknown response)")
    })
  }

  function authenticateUserInvalid() {
    return new Promise(async (resolve, reject) => {
      let result
      result = await authManager.authenticate('testuser@test.com','testuserpassworde')
        .catch(err => reject("Prepare User Test: FAILED (" + err + ")"))
      if (result[0].loginResponse === authManager.RESPONSE_INVALID_LOGIN)
        resolve("Authenticate User Invalid Test: SUCCESS")
      else if (result[0].loginResponse === authManager.RESPONSE_OK)
        resolve("Authenticate User Invalid Test: FAILED (invalid login)")
      else
        resolve("Authenticate User Invalid Test: FAILED (unknown response)")
    })
  }

  function changePassword() {
    return new Promise(async (resolve, reject) => {
      let result
      result = await authManager.changePassword('testuser@test.com', 'testuserpassword', 'testuserpassworde')
        .catch(err => reject("Change Password Test: FAILED (" + err + ")"))
      if (result[0].loginResponse === authManager.RESPONSE_INVALID_LOGIN)
        resolve("Change Password Test: FAILED (invalid login)")
      else if (result[0].loginResponse === authManager.PASSWORD_CHANGED) {
        result = await authManager.authenticate('testuser@test.com','testuserpassworde')
          .catch(err => reject("Change Password Test: FAILED (" + err + ")"))
        if (result[0].loginResponse === authManager.RESPONSE_OK)
          resolve("Authenticate User Invalid Test: SUCCESS")
        else if (result[0].loginResponse === authManager.RESPONSE_INVALID_LOGIN)
          reject("Change Password Test: FAILED (can't log in with new pass)")
      }
      else
        resolve("Change Password Test: FAILED (unknown response)")
    })
  }

  function cleanUp() {
    return new Promise(async (resolve, reject) => {
      let results = await db.mysql.queryPromise(
        "DELETE FROM `user` WHERE `email`=?",
        [ 'testuser@test.com' ]
      ).catch(err => reject(err))
      resolve(results.affectedRows)
    })
  }

  return {
    "run": run
  }
}
