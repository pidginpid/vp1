//moodul andmebaasiga suhtlemiseks, promise osaga async programmeerimise jaoks
const mysql = require('mysql2/promise');

//ameti "näitleja" id andmebaasi tabelis profession
const actorProfessionId = 1;

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

// isik filmis kirjete päring, kasutusel nii seoste lisamise rippmenüüs (tsitaadid) kui seoste lehel
const personInMovieSql = 'SELECT person_in_movie.id, person.first_name, person.last_name, movie.title AS movie_title, profession.title AS profession_title, person_in_movie.character_name FROM person_in_movie JOIN person ON person_in_movie.person_id = person.id JOIN movie ON person_in_movie.movie_id = movie.id JOIN profession ON person_in_movie.profession_id = profession.id ORDER BY movie.title, person.last_name, person.first_name';

// rippmenüüde tühjad andmed, kui andmebaasist lugemine ei õnnestu
const emptyFilmiseosedLists = () => {
	return {
		personList: [],
		movieList: [],
		professionList: [],
		genreList: [],
		companyList: [],
		personInMovieList: []
	};
};

// vormi väljade tühjad teated
const emptyFilmiseosedNotices = () => {
	return {
		relationNotice: null,
		personNotice: null,
		movieNotice: null,
		professionNotice: null,
		characterNotice: null,
		genreMovieNotice: null,
		genreNotice: null,
		companyMovieNotice: null,
		companyNotice: null,
		quotePimNotice: null,
		quoteTextNotice: null
	};
};

// seoste lisamise lehe vaikeväärtused, millele lisatakse (üle kirjutatakse) vajalikud väärtused
const filmiseosedFormData = (overrides) => {
	return Object.assign({
		notice: 'Ootan sisestust!',
		actorId: actorProfessionId,
		relation: null,
		personId: null,
		movieId: null,
		professionId: null,
		characterName: null,
		genreMovieId: null,
		genreId: null,
		companyMovieId: null,
		companyId: null,
		quotePimId: null,
		quoteText: null
	}, emptyFilmiseosedLists(), emptyFilmiseosedNotices(), overrides);
};

// loeb rippmenüüde jaoks inimesed, filmid, ametid, žanrid, tootmisettevõtted ja isikud filmides
const loadFilmiseosedLists = async (conn) => {
	const [personList] = await conn.execute('SELECT id, first_name, last_name FROM person ORDER BY last_name, first_name');
	const [movieList] = await conn.execute('SELECT id, title FROM movie ORDER BY title');
	const [professionList] = await conn.execute('SELECT id, title FROM profession ORDER BY title');
	const [genreList] = await conn.execute('SELECT id, name FROM genre ORDER BY name');
	const [companyList] = await conn.execute('SELECT id, name FROM production_company ORDER BY name');
	const [personInMovieList] = await conn.execute(personInMovieSql);
	return {
		personList: personList,
		movieList: movieList,
		professionList: professionList,
		genreList: genreList,
		companyList: companyList,
		personInMovieList: personInMovieList
	};
};

const filmiseosed = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const lists = await loadFilmiseosedLists(conn);
		res.render('filmiseosed_add', filmiseosedFormData(lists));
	} catch (err) {
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('filmiseosed_add', filmiseosedFormData({
			notice: 'Tekkis viga, andmeid ei õnnestunud lugeda!'
		}));
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for saving a new connection between Estonian films, professions, people, genres, production companies or quotes
//@route POST /eestifilm/filmiseosed_add
//@access public

const filmiseosedPost = async (req, res) => {
	console.log(req.body);
	const relation = req.body.relationInput;
	const validRelations = ['person_in_movie', 'movie_genre', 'movie_production_company', 'quote'];
	// vormi väärtused, mida vea korral vormi tagasi kuvatakse
	const formValues = {
		relation: req.body.relationInput,
		personId: req.body.personInput,
		movieId: req.body.movieInput,
		professionId: req.body.professionInput,
		characterName: req.body.characterInput,
		genreMovieId: req.body.genreMovieInput,
		genreId: req.body.genreInput,
		companyMovieId: req.body.companyMovieInput,
		companyId: req.body.companyInput,
		quotePimId: req.body.quotePimInput,
		quoteText: req.body.quoteTextInput
	};
	const notices = emptyFilmiseosedNotices();
	let lists = emptyFilmiseosedLists();
	// teeb valitud väärtusest positiivse täisarvu, vastasel juhul null
	const toId = (value) => {
		const num = Number(value);
		return Number.isInteger(num) && num > 0 ? num : null;
	};
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		lists = await loadFilmiseosedLists(conn);

		// kontrollime andmete olemasolu
		let inputValid = true;
		let sqlCheck = null;
		let sqlInsert = null;
		let sqlValues = null;

		if(!validRelations.includes(relation)) {
			notices.relationNotice = 'Seose tüüp on valimata!';
			inputValid = false;
		}
		else if(relation === 'person_in_movie') {
			const personId = toId(req.body.personInput);
			const movieId = toId(req.body.movieInput);
			const professionId = toId(req.body.professionInput);
			let characterValue = null;

			if(!personId) {
				notices.personNotice = 'Isik on valimata!';
				inputValid = false;
			}

			if(!movieId) {
				notices.movieNotice = 'Film on valimata!';
				inputValid = false;
			}

			if(!professionId) {
				notices.professionNotice = 'Amet on valimata!';
				inputValid = false;
			}
			else if(professionId === actorProfessionId && req.body.characterInput) {
				if(req.body.characterInput.length > 100) {
					notices.characterNotice = 'Tegelaskuju nimi ei tohi olla pikem kui 100 märki!';
					inputValid = false;
				}
				else {
					characterValue = req.body.characterInput;
				}
			}

			sqlCheck = 'SELECT id FROM person_in_movie WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name <=> ?';
			sqlInsert = 'INSERT INTO person_in_movie (person_id, movie_id, profession_id, character_name) VALUES (?, ?, ?, ?)';
			sqlValues = [personId, movieId, professionId, characterValue];
		}
		else if(relation === 'movie_genre') {
			const movieId = toId(req.body.genreMovieInput);
			const genreId = toId(req.body.genreInput);

			if(!movieId) {
				notices.genreMovieNotice = 'Film on valimata!';
				inputValid = false;
			}

			if(!genreId) {
				notices.genreNotice = 'Žanr on valimata!';
				inputValid = false;
			}

			sqlCheck = 'SELECT id FROM movie_genre WHERE movie_id = ? AND genre_id = ?';
			sqlInsert = 'INSERT INTO movie_genre (movie_id, genre_id) VALUES (?, ?)';
			sqlValues = [movieId, genreId];
		}
		else if(relation === 'movie_production_company') {
			const movieId = toId(req.body.companyMovieInput);
			const companyId = toId(req.body.companyInput);

			if(!movieId) {
				notices.companyMovieNotice = 'Film on valimata!';
				inputValid = false;
			}

			if(!companyId) {
				notices.companyNotice = 'Tootmisettevõte on valimata!';
				inputValid = false;
			}

			sqlCheck = 'SELECT id FROM movie_production_company WHERE movie_id = ? AND production_company_id = ?';
			sqlInsert = 'INSERT INTO movie_production_company (movie_id, production_company_id) VALUES (?, ?)';
			sqlValues = [movieId, companyId];
		}
		else {
			const personInMovieId = toId(req.body.quotePimInput);
			let quoteValue = null;

			if(!personInMovieId) {
				notices.quotePimNotice = 'Isik filmis on valimata!';
				inputValid = false;
			}

			if(!req.body.quoteTextInput) {
				notices.quoteTextNotice = 'Tsitaat on puudu!';
				inputValid = false;
			}
			else if(req.body.quoteTextInput.length > 1000) {
				notices.quoteTextNotice = 'Tsitaat ei tohi olla pikem kui 1000 märki!';
				inputValid = false;
			}
			else {
				quoteValue = req.body.quoteTextInput;
			}

			sqlCheck = 'SELECT id FROM quote WHERE person_in_movie_id = ? AND text = ?';
			sqlInsert = 'INSERT INTO quote (person_in_movie_id, text) VALUES (?, ?)';
			sqlValues = [personInMovieId, quoteValue];
		}

		if(!inputValid) {
			console.log('Andmed pole korrektsed');
			return res.render('filmiseosed_add', filmiseosedFormData(Object.assign({
				notice: 'Andmed on puudulikud!'
			}, lists, formValues, notices)));
		}

		// kontrollime, kas täpselt sama seos on juba olemas
		const [checkRes] = await conn.execute(sqlCheck, sqlValues);
		if(checkRes.length > 0) {
			console.log('Selline seos on juba olemas');
			return res.render('filmiseosed_add', filmiseosedFormData(Object.assign({
				notice: 'Selline seos on juba olemas, andmeid ei salvestatud!'
			}, lists, formValues, notices)));
		}

		await conn.execute(sqlInsert, sqlValues);
		res.render('filmiseosed_add', filmiseosedFormData(Object.assign({
			notice: 'Andmed salvestatud!'
		}, lists)));

	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('filmiseosed_add', filmiseosedFormData(Object.assign({
			notice: 'Tekkis viga, andmeid ei salvestatud!'
		}, lists, formValues)));
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for showing the connections between Estonian films, people, professions, genres, production companies and quotes
//@route GET /eestifilm/seosed
//@access public

const seosed = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const [personInMovieList] = await conn.execute(personInMovieSql);
		const [movieGenreList] = await conn.execute('SELECT movie.title AS movie_title, genre.name AS genre_name FROM movie_genre JOIN movie ON movie_genre.movie_id = movie.id JOIN genre ON movie_genre.genre_id = genre.id ORDER BY movie.title, genre.name');
		const [movieCompanyList] = await conn.execute('SELECT movie.title AS movie_title, production_company.name AS company_name FROM movie_production_company JOIN movie ON movie_production_company.movie_id = movie.id JOIN production_company ON movie_production_company.production_company_id = production_company.id ORDER BY movie.title, production_company.name');
		const [quoteList] = await conn.execute('SELECT quote.text, person.first_name, person.last_name, movie.title AS movie_title, profession.title AS profession_title FROM quote JOIN person_in_movie ON quote.person_in_movie_id = person_in_movie.id JOIN person ON person_in_movie.person_id = person.id JOIN movie ON person_in_movie.movie_id = movie.id JOIN profession ON person_in_movie.profession_id = profession.id ORDER BY movie.title, person.last_name, person.first_name');
		res.render('seosed', {
			personInMovieList: personInMovieList,
			movieGenreList: movieGenreList,
			movieCompanyList: movieCompanyList,
			quoteList: quoteList
		});
	} catch (err) {
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('seosed', {
			personInMovieList: [],
			movieGenreList: [],
			movieCompanyList: [],
			quoteList: []
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
	filmiseosedPost,
	seosed
}
