const express = require('express');
const checkLogin = require('../src/checkLogin.js');

const router = express.Router();
router.use(checkLogin.isLogin);

//kontrollerid
const {
	galleryOwnPhotos,
	galleryOwnPhotosHome } = require ('../controllers/galleryOwnPhotosControllers');

router.route('/').get(galleryOwnPhotos);

router.route('/edit/:page').get(galleryOwnPhotosHome);

module.exports = router;
