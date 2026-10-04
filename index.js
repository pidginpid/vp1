const express = require('express');
const fs = require('fs').promises;
// moodul URL-I lahtiharutamiseks, et saaks POST osad ka kättesaadavaks
const bodyparser = require('body-parser');
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

app.listen(5117);
