/**
* guide_to_tag.js
* The auto-generated data manipulator module for the 
* guide_to_tag data object.
*/
module.exports = (db) => {
	function createGuide_to_tag(guide_id,guide_tag_id) {
		return new Promise(async (resolve, reject) => {
			let guide_to_tag = await db.mysql.queryPromise('INSERT INTO `guide_to_tag` (guide_id,guide_tag_id) VALUES (?,?)',
				[guide_id,guide_tag_id])
				.catch(err => reject(err))
			resolve(guide_to_tag)
		})
	}
	function updateGuide_to_tag(id,guide_id,guide_tag_id) {
		return new Promise(async (resolve, reject) => {
			let guide_to_tag = await db.mysql.queryPromise('UPDATE `guide_to_tag` SET `guide_id`=?,`guide_tag_id`=? WHERE `id`=?',
			[guide_id,guide_tag_id,id])
				.catch(err => reject(err))
			resolve(guide_to_tag)
		})
	}
	function removeGuide_to_tag(id) {
		return new Promise(async (resolve, reject) => {
			let guide_to_tag = await db.mysql.queryPromise('DELETE FROM `guide_to_tag` WHERE `id`=?',
			[id])
				.catch(err => reject(err))
			resolve(guide_to_tag)
		})
	}
	function getGuide_to_tag(id) {
		return new Promise(async (resolve, reject) => {
			let guide_to_tag = await db.mysql.queryPromise('SELECT * FROM `guide_to_tag` WHERE `id`=?',
			[id])
				.catch(err => reject(err))
			resolve(guide_to_tag)
		})
	}
	function getGuide_to_tags() {
		return new Promise(async (resolve, reject) => {
			let guide_to_tags = await db.mysql.queryPromise('SELECT * FROM `guide_to_tag`',
			[])
				.catch(err => reject(err))
			resolve(guide_to_tags)
		})
	}
	return {
		"createGuide_to_tag": createGuide_to_tag,
		"updateGuide_to_tag": updateGuide_to_tag,
		"removeGuide_to_tag": removeGuide_to_tag,
		"getGuide_to_tag": getGuide_to_tag,
		"getGuide_to_tags": getGuide_to_tags
	}
}