const express = require('express');
const multer = require('multer');

const router = express.Router();

// seadistame multer vahevara (middleware) failide üleslaadimiseks
// määran üleslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});
// määrata saab veel näiteks lubatud failitüüpe, faili suuruse piirangut jne


//kontrollerid
const {
	galleryPhotoUpload,
	galleryPhotoUploadPost,
 	galleryPhotos } = require ('../controllers/galleryPhotoUploadControllers');

router.route('/').get(galleryPhotoUpload);

// post osa suunatakse läbi vahevara - upload
router.route('/').post(upload.single('photoInput'), galleryPhotoUploadPost);

router.route('/galleryPhotos').get(galleryPhotos);

module.exports = router;
