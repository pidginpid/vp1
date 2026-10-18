//moodul andmebaasiga suhtlemiseks, promise osaga async programmeerimise jaoks
const mysql = require('mysql2/promise');

//@desc home page for Estonian Film section 
//@route GET /eestifilm 
//@access public

//app.get('/eestifilm', (req,res)=>{
const eestifilm = (req, res) => {
	res.render('eestifilm');
};

//@desc page for list of people involved in Estonian film industry 
//@route GET /eestifilm 
//@access public

// app.get('/eestifilm/inimesed', async (req,res)=>{
const inimesed = async (req, res) => {
	//console.log('Andmebaasiserver on: ' + process.env.DB_HOST);
	const mysql = require('mysql2/promise');
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT * FROM person';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('inimesed', {personList: sqlRes});
	} catch (err) {
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('inimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding more people involved in the Estonian film industry 
//@route GET /eestifilm 
//@access public

const inimesedAddPost = async (req,res) => {
	console.log(req.body);
	// kontrollime andmete olemasolu
	const now = new Date();
	const bornDate = new Date(req.body.bornInput);
	let inputValid = true;
	let firstNameNotice = null;
	let lastNameNotice = null;
	let bornNotice = null;
	let deceasedNotice = null;
	let deceasedDate = null;

	if(!req.body.firstNameInput) {
		firstNameNotice = 'Eesnimi on puudu!';
		inputValid = false;
	}

	if(!req.body.lastNameInput) {
		lastNameNotice = 'Perekonnanimi on puudu!';
		inputValid = false;
	}

	if(!req.body.bornInput) {
		bornNotice = 'Sünnikuupäev on puudu!';
		inputValid = false;
	}
	else if(isNaN(bornDate.getTime())) {
		bornNotice = 'Sünnikuupäev ei ole korrektne kuupäev!';
		inputValid = false;
	}
	else if(bornDate > now) {
		bornNotice = 'Sünnikuupäev ei tohi olla tulevikus!';
		inputValid = false;
	}

	if(req.body.deceasedInput != '') {
		const deceasedDateObj = new Date(req.body.deceasedInput);
		if(isNaN(deceasedDateObj.getTime())) {
			deceasedNotice = 'Surmakuupäev ei ole korrektne kuupäev!';
			inputValid = false;
		}
		else if(deceasedDateObj > now) {
			deceasedNotice = 'Surmakuupäev ei tohi olla tulevikus!';
			inputValid = false;
		}
		else if(!bornNotice && deceasedDateObj < bornDate) {
			deceasedNotice = 'Surmakuupäev ei tohi olla varasem kui sünnikuupäev!';
			inputValid = false;
		}
		else {
			deceasedDate = req.body.deceasedInput;
		}
	}

	if(!inputValid) {
		console.log('Andmed pole korrektsed');
		return res.render('inimesed_add', {
			notice: 'Andmed on puudulikud!',
			firstName: req.body.firstNameInput,
			lastName: req.body.lastNameInput,
			born: req.body.bornInput,
			deceased: req.body.deceasedInput,
			firstNameNotice: firstNameNotice,
			lastNameNotice: lastNameNotice,
			bornNotice: bornNotice,
			deceasedNotice: deceasedNotice
		});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?, ?, ?, ?)';
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]
		//res.render('inimesed_add', {notice: 'Tekkis viga, andmeid ei salvestatud!'}
		);

	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('inimesed_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			firstName: req.body.firstNameInput,
			lastName: req.body.lastNameInput,
			born: req.body.bornInput,
			deceased: req.body.deceasedInput,
			firstNameNotice: null,
			lastNameNotice: null,
			bornNotice: null,
			deceasedNotice: null
		});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for waiting to have people involved in the Estonian film industry inserted 
//@route GET /eestifilm 
//@access public

//app.get('/eestifilm/inimesed_add', (req, res)=>{
const inimesedAdd = (req, res) => {
	res.render('inimesed_add', {
		notice: 'Ootan sisestust!',
		firstName: null,
		lastName: null,
		born: null,
		deceased: null,
		firstNameNotice: null,
		lastNameNotice: null,
		bornNotice: null,
		deceasedNotice: null
	});
};

//@desc page for waiting to have Estonian films inserted 
//@route GET /eestifilm/filmid_add 
//@access public

const filmidAdd = (req, res) => {
	res.render('filmid_add', {
		notice: 'Ootan sisestust!',
		title: null,
		release: null,
		duration: null,
		description: null,
		titleNotice: null,
		releaseNotice: null,
		durationNotice: null,
		descriptionNotice: null
	});
};

//@desc page for adding Estonian films 
//@route POST /eestifilm/filmid_add 
//@access public

const filmidAddPost = async (req, res) => {
	console.log(req.body);
	// kontrollime andmete olemasolu
	const releaseYear = Number(req.body.releaseInput);
	const durationMinutes = Number(req.body.durationInput);
	let inputValid = true;
	let titleNotice = null;
	let releaseNotice = null;
	let durationNotice = null;
	let descriptionNotice = null;
	let descriptionValue = null;

	if(!req.body.titleInput) {
		titleNotice = 'Pealkiri on puudu!';
		inputValid = false;
	}
	else if(req.body.titleInput.length > 100) {
		titleNotice = 'Pealkiri ei tohi olla pikem kui 100 märki!';
		inputValid = false;
	}

	if(!req.body.releaseInput) {
		releaseNotice = 'Väljastamise aasta on puudu!';
		inputValid = false;
	}
	else if(!Number.isInteger(releaseYear) || releaseYear < 1) {
		releaseNotice = 'Väljastamise aasta ei ole korrektne täisarv!';
		inputValid = false;
	}

	if(!req.body.durationInput) {
		durationNotice = 'Kestvus on puudu!';
		inputValid = false;
	}
	else if(!Number.isInteger(durationMinutes) || durationMinutes < 1) {
		durationNotice = 'Kestvus ei ole korrektne täisarv minutites!';
		inputValid = false;
	}

	if(req.body.descriptionInput) {
		if(req.body.descriptionInput.length > 1000) {
			descriptionNotice = 'Kirjeldus ei tohi olla pikem kui 1000 märki!';
			inputValid = false;
		}
		else {
			descriptionValue = req.body.descriptionInput;
		}
	}

	if(!inputValid) {
		console.log('Andmed pole korrektsed');
		return res.render('filmid_add', {
			notice: 'Andmed on puudulikud!',
			title: req.body.titleInput,
			release: req.body.releaseInput,
			duration: req.body.durationInput,
			description: req.body.descriptionInput,
			titleNotice: titleNotice,
			releaseNotice: releaseNotice,
			durationNotice: durationNotice,
			descriptionNotice: descriptionNotice
		});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO movie (title, release_year, duration_minutes, description) VALUES (?, ?, ?, ?)';
		await conn.execute(sqlReq, [
			req.body.titleInput,
			releaseYear,
			durationMinutes,
			descriptionValue
		]);
		res.render('filmid_add', {
			notice: 'Andmed salvestatud!',
			title: null,
			release: null,
			duration: null,
			description: null,
			titleNotice: null,
			releaseNotice: null,
			durationNotice: null,
			descriptionNotice: null
		});

	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('filmid_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			title: req.body.titleInput,
			release: req.body.releaseInput,
			duration: req.body.durationInput,
			description: req.body.descriptionInput,
			titleNotice: null,
			releaseNotice: null,
			durationNotice: null,
			descriptionNotice: null
		});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for waiting to have professions related to Estonian film inserted 
//@route GET /eestifilm/ametid_add 
//@access public

const ametidAdd = (req, res) => {
	res.render('ametid_add', {
		notice: 'Ootan sisestust!',
		title: null,
		description: null,
		titleNotice: null,
		descriptionNotice: null
	});
};

//@desc page for adding professions related to Estonian film 
//@route POST /eestifilm/ametid_add 
//@access public

const ametidAddPost = async (req, res) => {
	console.log(req.body);
	// kontrollime andmete olemasolu
	let inputValid = true;
	let titleNotice = null;
	let descriptionNotice = null;
	let descriptionValue = null;

	if(!req.body.titleInput) {
		titleNotice = 'Ameti nimetus on puudu!';
		inputValid = false;
	}
	else if(req.body.titleInput.length > 50) {
		titleNotice = 'Ameti nimetus ei tohi olla pikem kui 50 märki!';
		inputValid = false;
	}

	if(req.body.descriptionInput) {
		if(req.body.descriptionInput.length > 1000) {
			descriptionNotice = 'Kirjeldus ei tohi olla pikem kui 1000 märki!';
			inputValid = false;
		}
		else {
			descriptionValue = req.body.descriptionInput;
		}
	}

	if(!inputValid) {
		console.log('Andmed pole korrektsed');
		return res.render('ametid_add', {
			notice: 'Andmed on puudulikud!',
			title: req.body.titleInput,
			description: req.body.descriptionInput,
			titleNotice: titleNotice,
			descriptionNotice: descriptionNotice
		});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO profession (title, description) VALUES (?, ?)';
		await conn.execute(sqlReq, [
			req.body.titleInput,
			descriptionValue
		]);
		res.render('ametid_add', {
			notice: 'Andmed salvestatud!',
			title: null,
			description: null,
			titleNotice: null,
			descriptionNotice: null
		});

	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('ametid_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			title: req.body.titleInput,
			description: req.body.descriptionInput,
			titleNotice: null,
			descriptionNotice: null
		});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding connections between different tables for Estonian films, professions and people. 
//@route GET /eestifilm/filmiseosed_add 
//@access public

const filmiseosed = (req, res) => {
	res.render('filmiseosed_add');
};

const filmiseosedPost = async (req, res) => {
	console.log(req.body);
	// ühendus andmebaasiga
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		// If statement, kui valitakse person_in_movie
		let sqlReq = 'INSERT INTO profession (title, description) VALUES (?, ?)';
		await conn.execute(sqlReq, [
			req.body.titleInput,
			descriptionValue
		]);
		res.render('ametid_add', {
			notice: 'Andmed salvestatud!',
			title: null,
			description: null,
			titleNotice: null,
			descriptionNotice: null
		});

	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('ametid_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			title: req.body.titleInput,
			description: req.body.descriptionInput,
			titleNotice: null,
			descriptionNotice: null
		});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	filmidAdd,
	filmidAddPost,
	ametidAdd,
	ametidAddPost,
	filmiseosed,
	filmiseosedPost
}