/**
* user.js
* The auto-generated data manipulator module for the 
* user data object.
*/
module.exports = (db) => {
	function createUser(email,password_hash,active,confirmation_uuid) {
		return new Promise(async (resolve, reject) => {
			let user = await db.mysql.queryPromise('INSERT INTO `user` (email,password_hash,active,confirmation_uuid) VALUES (?,?,?,?)',
				[email,password_hash,active,confirmation_uuid])
				.catch(err => reject(err))
			resolve(user)
		})
	}
	function updateUser(id,email,password_hash,active,confirmation_uuid) {
		return new Promise(async (resolve, reject) => {
			let user = await db.mysql.queryPromise('UPDATE `user` SET `email`=?,`password_hash`=?,`active`=?,`confirmation_uuid`=? WHERE `id`=?',
			[email,password_hash,active,confirmation_uuid,id])
				.catch(err => reject(err))
			resolve(user)
		})
	}
	function removeUser(id) {
		return new Promise(async (resolve, reject) => {
			let user = await db.mysql.queryPromise('DELETE FROM `user` WHERE `id`=?',
			[id])
				.catch(err => reject(err))
			resolve(user)
		})
	}
	function getUser(id) {
		return new Promise(async (resolve, reject) => {
			let user = await db.mysql.queryPromise('SELECT * FROM `user` WHERE `id`=?',
			[id])
				.catch(err => reject(err))
			resolve(user)
		})
	}
	function getUsers() {
		return new Promise(async (resolve, reject) => {
			let users = await db.mysql.queryPromise('SELECT * FROM `user`',
			[])
				.catch(err => reject(err))
			resolve(users)
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