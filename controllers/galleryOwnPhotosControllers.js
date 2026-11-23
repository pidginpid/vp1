const mysql = require('mysql2/promise');

// privaatsuse numbrite tähendused (samad, mis galeriipiltide üleslaadimise vormil)
const privacyTexts = {
	1: 'Privaatne (ainult ise näen)',
	2: 'Sisseloginud kasutajatele',
	3: 'Avalik (kõik näevad)'
};

//@desc page for viewing the logged in user's own gallery photos
//@route GET /galleryOwnPhotos
//@access private

const galleryOwnPhotos = async (req, res) => {
	let conn;
	let id = req.session.id;
	let skip = 0;
	const limit = 5;
	const privacy = 2;
	// kontrollime, et lk number poleksliiga väike või, et ta üldse on number
	if(id < 1 || isNaN){
		id = 1;
	}
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT id, filename, alttext, privacy FROM galleryphotos WHERE userid = ? AND deleted IS NULL';
		const [sqlRes] = await conn.execute(sqlReq, [req.session.userId]);
		sqlRes.forEach(function(photo){
			photo.privacyText = privacyTexts[photo.privacy];
		});
		res.render('galleryOwnPhotos', {pictureList: sqlRes});
	} catch (err) {
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('galleryOwnPhotos', {pictureList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
}

//@desc page for editing one of the logged in user's own gallery photos
//@route GET /galleryOwnPhotos/edit/:id
//@access private

const galleryOwnPhotosHome = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		// foto loetakse ainult siis, kui see kuulub sisseloginud kasutajale ja pole kustutatud
		const sqlReq = 'SELECT id, filename, alttext, privacy FROM galleryphotos WHERE id = ? AND userid = ? AND deleted IS NULL';
		const [sqlRes] = await conn.execute(sqlReq, [req.params.id, req.session.userId]);
		if(sqlRes.length === 0){
			// võõrast või olematut pilti ei näidata
			return res.redirect('/galleryOwnPhotos');
		}
		const photo = sqlRes[0];
		photo.privacyText = privacyTexts[photo.privacy];
		res.render('galleryOwnPhotosEdit', {picture: photo});
	} catch (err) {
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.redirect('/galleryOwnPhotos');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
}

//@desc changing or deleting one of the logged in user's own gallery photos
//@route POST /galleryOwnPhotos/edit/:id
//@access private

const galleryOwnPhotosEditPost = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		// enne muutmist kontrollime, et foto tõesti kuulub sisseloginud kasutajale
		let sqlReq = 'SELECT id FROM galleryphotos WHERE id = ? AND userid = ? AND deleted IS NULL';
		const [sqlRes] = await conn.execute(sqlReq, [req.params.id, req.session.userId]);
		if(sqlRes.length === 0){
			console.log('Foto ei kuulu sisseloginud kasutajale või seda pole olemas!');
			return res.redirect('/galleryOwnPhotos');
		}
		// kumba nuppu vajutati, kustutamist või muutmist
		if(req.body.photoDelete){
			sqlReq = 'UPDATE galleryphotos SET deleted = NOW() WHERE id = ? AND userid = ?';
			await conn.execute(sqlReq, [req.params.id, req.session.userId]);
		} else {
			const privacy = parseInt(req.body.privacyInput);
			if(![1, 2, 3].includes(privacy)){
				console.log('Privaatsuse väärtus pole korrektne!');
				return res.redirect('/galleryOwnPhotos/edit/' + req.params.id);
			}
			let altText = (req.body.altInput || '').trim();
			if(altText === ''){
				altText = null;
			}
			sqlReq = 'UPDATE galleryphotos SET privacy = ?, alttext = ? WHERE id = ? AND userid = ?';
			await conn.execute(sqlReq, [privacy, altText, req.params.id, req.session.userId]);
		}
		res.redirect('/galleryOwnPhotos');
	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.redirect('/galleryOwnPhotos');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
}


module.exports = {
	galleryOwnPhotos,
	galleryOwnPhotosHome,
	galleryOwnPhotosEditPost
}