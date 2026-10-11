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
app.get('/', (req, res)=>{
	//res.send('Express.js läks käima ja serveerib meile veebi.');
	const dayNow = dateET.currentDay();
	const dateNow = dateET.fullDate();
	const timeNow = dateET.fullTime();
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
});

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

app.get('/eestifilm', (req,res)=>{
	res.render('eestifilm');
});

app.get('/eestifilm/inimesed', async (req,res)=>{
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
});

app.get('/eestifilm/inimesed_add', (req, res)=>{
	res.render('inimesed_add', {notice: 'Ootan sisestust!'});
});

app.post('/eestifilm/inimesed_add', async (req, res)=>{
	console.log(req.body);
	// kontrollime andmete olemasolu
	const now = new Date();
	const bornDate = new Date(req.body.bornInput);
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > now) {
		console.log('Andmed pole korrektsed');
		return res.render('inimesed_add', {notice: 'Andmed on puudulikud!'});
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
		let deceasedDate = null;
		if(req.body.deceasedInput !='' || isNaN(req.body.deceasedInput) || req.body.deceasedInput < bornDate) {
			deceasedDate = req.body.deceasedInput;
		}
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
		res.render('inimesed_add', {notice: 'Tekkis viga, andmeid ei salvestatud!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/filmid_add', (req, res)=>{
	res.render('filmid_add', {notice: 'Ootan sisestust!'});
});

app.get('/eestifilm/ametid_add', (req, res)=>{
	res.render('ametid_add', {notice: 'Ootan sisestust!'});
});

app.listen(5117);
