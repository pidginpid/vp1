const express = require('express');
const checkLogin = require('../src/checkLogin.js');

const router = express.Router();
router.use(checkLogin.isLogin);

//kontrollerid
const {
	galleryOwnPhotos } = require ('../controllers/galleryOwnPhotosControllers');

router.route('/').get(galleryOwnPhotos);

module.exports = router;
