const express = require('express');
const checkLogin = require('../src/checkLogin.js');

const router = express.Router();
router.use(checkLogin.isLogin);

//kontrollerid
const {
	galleryOwnPhotos,
	galleryOwnPhotosHome,
	galleryOwnPhotosEditPost } = require ('../controllers/galleryOwnPhotosControllers');

router.route('/').get(galleryOwnPhotos);

router.route('/edit/:id').get(galleryOwnPhotosHome);

router.route('/edit/:id').post(galleryOwnPhotosEditPost);

module.exports = router;