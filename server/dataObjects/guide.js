/**
* guide.js
* The auto-generated data manipulator module for the 
* guide data object.
*/
module.exports = (db) => {
	function createGuide(user_id,first_name,last_name,location,rating,display_picture) {
		return new Promise(async (resolve, reject) => {
			let guide = await db.mysql.queryPromise('INSERT INTO `guide` (user_id,first_name,last_name,location,rating,display_picture) VALUES (?,?,?,?,?,?)',
				[user_id,first_name,last_name,location,rating,display_picture])
				.catch(err => reject(err))
			resolve(guide)
		})
	}
	function updateGuide(id,user_id,first_name,last_name,location,rating,display_picture) {
		return new Promise(async (resolve, reject) => {
			let guide = await db.mysql.queryPromise('UPDATE `guide` SET `user_id`=?,`first_name`=?,`last_name`=?,`location`=?,`rating`=?,`display_picture`=? WHERE `id`=?',
			[user_id,first_name,last_name,location,rating,display_picture,id])
				.catch(err => reject(err))
			resolve(guide)
		})
	}
	function removeGuide(id) {
		return new Promise(async (resolve, reject) => {
			let guide = await db.mysql.queryPromise('DELETE FROM `guide` WHERE `id`=?',
			[id])
				.catch(err => reject(err))
			resolve(guide)
		})
	}
	function getGuide(id) {
		return new Promise(async (resolve, reject) => {
			let guide = await db.mysql.queryPromise('SELECT * FROM `guide` WHERE `id`=?',
			[id])
				.catch(err => reject(err))
			resolve(guide)
		})
	}
	function getGuides() {
		return new Promise(async (resolve, reject) => {
			let guides = await db.mysql.queryPromise('SELECT * FROM `guide`',
			[])
				.catch(err => reject(err))
			resolve(guides)
		})
	}
	return {
		"createGuide": createGuide,
		"updateGuide": updateGuide,
		"removeGuide": removeGuide,
		"getGuide": getGuide,
		"getGuides": getGuides
	}
}