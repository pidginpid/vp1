const mysql = require('mysql2/promise');

// privaatsuse numbrite tähendused (samad, mis galeriipiltide üleslaadimise vormil)
const privacyTexts = {
	1: 'Privaatne (ainult ise näen)',
	2: 'Sisseloginud kasutajatele',
	3: 'Avalik (kõik näevad)'
};

//@desc Photogallery opening page
//@route GET /galleryPhotos
//@access private

const galleryOwnHome = (req, res) => {
	res.redirect('/galleryOwnPhotos/edit/1');
}

//@desc page for viewing the logged in user's own gallery photos
//@route GET /galleryOwnPhotos
//@access private

const galleryOwnPhotos = async (req, res) => {
	let conn;
	let page = parseInt(req.params.page);
	let skip = 0;
	const limit = 5;
	const privacy = 2;
	// kontrollime, et lk number poleksliiga väike või, et ta üldse on number
	if(page < 1 || isNaN){
		page = 1;
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


module.exports = {
	galleryOwnPhotos
}
