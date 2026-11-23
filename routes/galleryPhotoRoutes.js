const express = require('express');
const multer = require('multer');
const checkLogin = require('../src/checkLogin.js');

const router = express.Router();
router.use(checkLogin.isLogin);

// seadistame multer vahevara (middleware) failide üleslaadimiseks
// määran üleslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});
// määrata saab veel näiteks lubatud failitüüpe, faili suuruse piirangut jne


//kontrollerid
const {
 	galleryPhotos,
	galleryHome } = require ('../controllers/galleryPhotosController');

router.route('/').get(galleryHome);

router.route('/:page').get(galleryPhotos);

// router.route('my').get(myGalleryPage);

module.exports = router;
