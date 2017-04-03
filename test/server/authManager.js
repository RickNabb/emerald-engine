/**
* authManager.js
* The tests for the authentication manager.
*/

module.exports = (db) {

  let bcrypt = require('bcrypt-nodejs')
  let uuid = require('tiny-uuid4')

  let tests = [
    prepareUser
  ]

  function run() {
    let res
    console.log("--- Starting Auth Manager Tests ---")
    for (test in tests) {
      res = test()
      if (!res) break
    }
    console.log("--- Stopping Auth Manager Tests ---")
  }

  function prepareUser() {
    bcrypt.hash('testsuiteuserpassword', null, null, (err, hash) => {
      if (err) console.log("Auth Manager Prepare User : FAILED - " + err)
      db.mysql.query(
        "INSERT INTO `users` (`username`, `email`, `password_hash`, `active`, `confirmation_uuid`) VALUES (?, ?, ?, ?, ?)",
        [ 'test_suite_user', 'testsuiteuser@email.com', hash, uuid() ],
        function (result) {
          if (result.affectedRows === 1 && result.insertId !== -1) {
            console.log("Auth Manager Prepare User : PASSED")
          }
        }
      )
    })
  }

  return {
    "run": run
  }
}
