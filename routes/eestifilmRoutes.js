const express = require('express');
const router = express.Router();

//kontrollerid
const {
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
	seosed } = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_add').get(inimesedAdd);

router.route('/inimesed_add').post(inimesedAddPost);

router.route('/filmid_add').get(filmidAdd);

router.route('/filmid_add').post(filmidAddPost);

router.route('/ametid_add').get(ametidAdd);

router.route('/ametid_add').post(ametidAddPost);

router.route('/filmiseosed_add').get(filmiseosed);

router.route('/filmiseosed_add').post(filmiseosedPost);

router.route('/seosed').get(seosed);

module.exports = router;
