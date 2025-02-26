const express = require('express')
const router = express.Router()
const passport = require('passport')
const oauthControllor = require('../../controllers/oauthController')

// 카카오 로그인
router.post('/kakao/login', oauthControllor.kakaoCallback)

module.exports = router
