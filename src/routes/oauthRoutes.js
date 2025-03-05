const express = require('express')
const router = express.Router()
const oauthControllor = require('../controllers/oauthController')

const { checkProvider } = require('../middlewares/isAuth')

// 카카오 로그인
router.post('/login', checkProvider, oauthControllor.oauthLogin)

module.exports = router
