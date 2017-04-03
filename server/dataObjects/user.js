/**
* user.js
* The auto-generated data manipulator module for the 
* user data object.
*/
module.exports = (db) => {
	function createUser(email,password_hash,active,confirmation_uuid,callback) {
		db.query('INSERT INTO `user` (email,password_hash,active,confirmation_uuid) VALUES (?,?,?,?)',
			[email,password_hash,active,confirmation_uuid],
			function(err, res) {
				callback(err, res)
			})
	}
	function updateUser(id,email,password_hash,active,confirmation_uuid,callback) {
		db.query('UPDATE `user` SET `email`=?,`password_hash`=?,`active`=?,`confirmation_uuid`=? WHERE `id`=?)',
			[email,password_hash,active,confirmation_uuid,id],
			function(err, res) {
				callback(err, res)
			})
	}
	function removeUser(id,callback) {
		db.query('DELETE FROM `user` WHERE `id`=?)',
			[id],
			function(err, res) {
				callback(err, res)
			})
	}
	function getUser(id,callback) {
		db.query('SELECT * FROM `user` WHERE `id`=?)',
			[id],
			function(err, res) {
				callback(err, res)
			})
	}
	function getUsers(id,callback) {
		db.query('SELECT * FROM `user` )',
			[],
			function(err, res) {
				callback(err, res)
			})
	}
	return {
		"createUser": createUser,
		"updateUser": updateUser,
		"removeUser": removeUser,
		"getUser": getUser,
		"getUsers": getUsers
	}
}