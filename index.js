const express = require('express');
const fs = require('fs').promises;
// moodul URL-I lahtiharutamiseks, et saaks POST osad ka kättesaadavaks
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks, promise osaga async programmeerimise jaoks
const mysql = require('mysql2/promise');
// moodul .env faili lugemiseks, keskkonnamuutuja parsimiseks
require('dotenv').config();
const dateET = require('./src/dateFindET');

const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';
// käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();
// määrame veebilehtedele mallide renderdamise mootori
app.set('view engine', 'ejs');
// määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));
// parsime vormiandmed, et req.body oleks kättesaadav (false, kuna vormis on ainult tekst)
app.use(bodyparser.urlencoded({extended: false}));

// loon andmebaasiühenduse
/* const conn = mysql.createConnection({
	host: 'localhost',
	user: 'if26',
	password: 'ifikas26',
	database: 'if26_karlpros'
}); */

// marsruudid
app.get('/', async (req, res)=>{
	//res.send('Express.js läks käima ja serveerib meile veebi.');
	try {
		const dayNow = dateET.currentDay();
		const dateNow = dateET.fullDate();
		const timeNow = dateET.fullTime();
		const rawText = await fs.readFile(regTextRef, 'utf8');
		let visitList = rawText.split(';');
		// viimane element on tühi (lõpus olev semikoolon), seega viimane külastus on eelviimane
		let lastVisitParts = visitList[visitList.length - 2].split(',');
		// osad: [0] nimi, [1] kuupäev, [2] kellaaeg
		res.render('index', {lastVisit: 'Viimati registreeriti külastus ' + lastVisitParts[1].trim() + ', kell ' + lastVisitParts[2].trim() + ' kui seda tegi ' + lastVisitParts[0].trim(), dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
		//res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
	} catch(err) {
		res.render('index', {lastVisit: 'Ei leidnud ühtegi külastust!'})
	}
});

/* app.get('/lastvisit', async (req, res)=>{
	try {
		const rawText = await fs.readFile(regTextRef, 'utf8');
		let visitList = rawText.split(';');
		// viimane element on tühi (lõpus olev semikoolon), seega viimane külastus on eelviimane
		let lastVisitParts = visitList[visitList.length - 2].split(',');
		// osad: [0] nimi, [1] kuupäev, [2] kellaaeg
		res.render('lastvisit', {lastVisit: 'Viimati registreeriti külastus ' + lastVisitParts[1].trim() + ', kell ' + lastVisitParts[2].trim() + ' kui seda tegi ' + lastVisitParts[0].trim()});
	} catch(err) {
		res.render('lastvisit', {lastVisit: 'Ei leidnud ühtegi külastust!'});
	}
}); */

app.get('/kass', (req, res)=>{
	res.render('kass');
});

app.get('/vanasona', async (req, res)=>{
	try {
		const rawText = await fs.readFile(textRef, 'utf8');
		let folkWisdom = rawText.split(';');
		let randomWisdom = folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))];
		res.render('vanasona', {wisdom: randomWisdom});

	} catch(err) {
		res.render('vanasona', {wisdom: 'Ei leidnud ühtegi vanasõna!'});
	}
});

app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res)=>{
	try {
		await fs.open(regTextRef, 'a');
		// külastuse kuupäev ja kellaaeg dateFindET.js moodulist
		const visitDate = dateET.fullDate();
		const visitTime = dateET.fullTime();
		await fs.appendFile(regTextRef, req.body.nameInput + ', ' + visitDate + ', ' + visitTime + ';');
		res.render('regvisit');
	} catch (err){
		console.log(err);
	}
});

app.get('/lastvisit', async (req, res)=>{
	try {
		const rawText = await fs.readFile(regTextRef, 'utf8');
		let visitList = rawText.split(';');
		// viimane element on tühi (lõpus olev semikoolon), seega viimane külastus on eelviimane
		let lastVisitParts = visitList[visitList.length - 2].split(',');
		// osad: [0] nimi, [1] kuupäev, [2] kellaaeg
		res.render('lastvisit', {lastVisit: 'Viimati registreeriti külastus ' + lastVisitParts[1].trim() + ', kell ' + lastVisitParts[2].trim() + ' kui seda tegi ' + lastVisitParts[0].trim()});
	} catch(err) {
		res.render('lastvisit', {lastVisit: 'Ei leidnud ühtegi külastust!'});
	}
});

/* app.get('/eestifilm', (req,res)=>{
	res.render('eestifilm');
}); */

/* app.get('/eestifilm/inimesed', async (req,res)=>{
	console.log('Andmebaasiserver on: ' + process.env.DB_HOST);
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
}); */

/* app.get('/eestifilm/inimesed_add', (req, res)=>{
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
}); */

/* app.post('/eestifilm/inimesed_add', async (req, res)=>{
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
}); */

//Eesti filmi marsruudid
const eestifilmRouter = require('./routes/eestifilmRoutes')
app.use('/eestifilm', eestifilmRouter);

//Külastuse registreerimise marsruut
const kulastuseRoute = require('./routes/kulastuseRoute')
app.use('/regvisit', kulastuseRoute);

app.listen(5117);