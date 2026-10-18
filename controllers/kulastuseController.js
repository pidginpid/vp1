const fs = require('fs').promises;
const dateET = require('../src/dateFindET');
const regTextRef = 'public/txt/visits.txt';

//@desc page for adding latest visited person 
//@route GET /regvisit 
//@access public

const regVisit = (req, res) => {
	res.render('regvisit');
};

//@desc page for adding latest visited person 
//@route POST /regvisit 
//@access public

const regVisitPost = async (req, res) => {
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
};

module.exports = {
	regVisit,
	regVisitPost
}