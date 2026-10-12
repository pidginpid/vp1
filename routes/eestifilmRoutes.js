const express = require('express');
const router = express.Router();

//kontrollerid
const {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost } = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_add').get(inimesedAdd);

router.route('/inimesed_add').get(inimesedAddPost);

module.exports = router;