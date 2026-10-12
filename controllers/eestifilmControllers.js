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

const inimesedAddPost = async (req,res) =>
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
const inimesedAdd = (req, res) =>
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

module.exports = {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost
}