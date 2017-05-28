/**
* guide_tag.js
* The auto-generated data manipulator module for the 
* guide_tag data object.
*/
module.exports = (db) => {
	function createGuide_tag(tag) {
		return new Promise(async (resolve, reject) => {
			let guide_tag = await db.mysql.queryPromise('INSERT INTO `guide_tag` (tag) VALUES (?)',
				[tag])
				.catch(err => reject(err))
			resolve(guide_tag)
		})
	}
	function updateGuide_tag(id,tag) {
		return new Promise(async (resolve, reject) => {
			let guide_tag = await db.mysql.queryPromise('UPDATE `guide_tag` SET `tag`=? WHERE `id`=?',
			[tag,id])
				.catch(err => reject(err))
			resolve(guide_tag)
		})
	}
	function removeGuide_tag(id) {
		return new Promise(async (resolve, reject) => {
			let guide_tag = await db.mysql.queryPromise('DELETE FROM `guide_tag` WHERE `id`=?',
			[id])
				.catch(err => reject(err))
			resolve(guide_tag)
		})
	}
	function getGuide_tag(id) {
		return new Promise(async (resolve, reject) => {
			let guide_tag = await db.mysql.queryPromise('SELECT * FROM `guide_tag` WHERE `id`=?',
			[id])
				.catch(err => reject(err))
			resolve(guide_tag)
		})
	}
	function getGuide_tags() {
		return new Promise(async (resolve, reject) => {
			let guide_tags = await db.mysql.queryPromise('SELECT * FROM `guide_tag`',
			[])
				.catch(err => reject(err))
			resolve(guide_tags)
		})
	}
	return {
		"createGuide_tag": createGuide_tag,
		"updateGuide_tag": updateGuide_tag,
		"removeGuide_tag": removeGuide_tag,
		"getGuide_tag": getGuide_tag,
		"getGuide_tags": getGuide_tags
	}
}