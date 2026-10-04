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
		await fs.appendFile(regTextRef, reg.body.nameInput + ';');
		res.render('regvisit');
	} catch (err){
		console.log(err);
	}
});

app.listen(5117);
