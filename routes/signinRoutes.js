const express = require('express');
const router = express.Router();

//kontrollerid
const {
	signinPage,
	signinPagePost, } = require('../controllers/signupControllers');

router.route('/').get(signinPage);

router.route('/').post(signinPagePost);

module.exports = router;
