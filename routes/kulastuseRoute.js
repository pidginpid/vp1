const express = require('express');
const router = express.Router();

//kontrollerid
const {
	regVisit, 
	regVisitPost } = require('../controllers/kulastuseController');

router.route('/').get(regVisit);

router.route('/').post(regVisitPost);

module.exports = router;