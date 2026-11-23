const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

//@desc Photogallery opening page
//@route GET /galleryPhotos
//@access private

const galleryHome = (req, res) => {
	res.redirect('/galleryPhotos/1');
}

//@desc Photogallery
//@route GET /galleryPhotos/:page
//@access private

const galleryPhotos = async (req, res) => {
	//console.log('Andmebaasiserver on: ' + process.env.DB_HOST);
	const mysql = require('mysql2/promise');
	let conn;
	let galleryData = [];
	let galleryLinks;
	let page = parseInt(req.params.page);
	let skip = 0;
	const limit = 5;
	const privacy = 2;
	// kontrollime, et lk number poleksliiga väike või, et ta üldse on number
	if(isNaN(page) || page < 1){
		page = 1;
	}
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		// uurime, palju galeriise sobivaid fotosid üldse on
		let sqlReq = 'SELECT count(id) AS photos FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL';
		const [countResult] = await conn.execute(sqlReq, [privacy]);
		const photoCount = countResult[0].photos;
		// kui leheküljenumber on liiga suur
		if((page - 1) * limit >= photoCount){
			// valin kõige viimase võimaliku lehekülje
			page = Math.max(1, Math.ceil(photoCount / limit));
		}
		skip = (page - 1) * limit;
		
		// teeme navigatsioonilingid
		// tagasi
		if(page === 1){
			galleryLinks = 'Eelmine leht &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;';
		} else {
			galleryLinks = `<a href="/galleryPhotos/${page - 1}">Eelmine leht</a> &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;`;
		}
		// edasi
		if(page * limit >= photoCount){
			galleryLinks += 'Järgmine leht';
		} else {
			galleryLinks += `<a href="/galleryPhotos/${page + 1}">Järgmine leht</a>`;
		}
		
		// LIMIT ja OFFSET antakse tekstina, sest execute() ei võta numbrit LIMIT/OFFSET väärtuseks
		sqlReq = 'SELECT id, filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL LIMIT ? OFFSET ?';
		const [sqlRes] = await conn.execute(sqlReq, [privacy, limit.toString(), skip.toString()]);
		console.log(sqlRes);
		sqlRes.forEach(function(photo){
			if(!photo.alttext) {
				photo.alttext = 'Uusim avalik foto';
			}
			galleryData.push({src: photo.filename, alt: photo.alttext, id: photo.id});
		});
		res.render('galleryPhotos', {galleryData: galleryData, pictureList: sqlRes, links: galleryLinks});
	} catch (err) {
		console.log('Viga andmebaasist lugemisel: ' + err);
		galleryLinks = 'Eelmine leht &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; Järgmine leht';
		res.render('galleryPhotos', {galleryData: galleryData, pictureList: [], links: galleryLinks});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
}


module.exports = {
	galleryPhotos,
	galleryHome
}