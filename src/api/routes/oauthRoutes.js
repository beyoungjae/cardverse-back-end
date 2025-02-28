const express = require('express')
const router = express.Router()
const passport = require('passport')
const oauthControllor = require('../../controllers/oauthController')
const { isKakaoRefreshToken } = require('../middlewares/isRefreshToken')

// 카카오 로그인
router.post('/kakao/login', oauthControllor.kakaoLogin)
// router.get('/kakao/logout')
router.get('/kakao/status', isKakaoRefreshToken, oauthControllor.refreshAccessToken)
// router.delete('/kakao/delete-account')

module.exports = router
