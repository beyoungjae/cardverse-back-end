const express = require('express')
const router = express.Router()
const { isLoggedIn, isNotLoggedIn, checkProvider, providerHandler } = require('../middlewares/isAuth')
const { validLogin, validSignup } = require('../middlewares/validators')
const authController = require('../controllers/authController')

router.post('/login', isNotLoggedIn, validLogin, authController.login)

router.post('/signup', isNotLoggedIn, validSignup, authController.signup)

router.post('/status', checkProvider, providerHandler('status'))

router.get('/logout', checkProvider, isLoggedIn, providerHandler('logout'))

router.put('/profile', checkProvider, isLoggedIn, authController.updateProfile)

module.exports = router
