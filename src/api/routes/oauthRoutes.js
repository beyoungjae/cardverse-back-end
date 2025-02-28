const express = require('express')
const router = express.Router()
const passport = require('passport')
const oauthControllor = require('../../controllers/oauthController')
const { isKakaoRefreshToken } = require('../middlewares/isRefreshToken')
const { isNotLoggedInOAuth, isLoggedInOAuth } = require('../middlewares/isOAuth')

// 카카오 로그인
router.post('/kakao/login', oauthControllor.kakaoLogin)
router.get('/kakao/logout', isLoggedInOAuth, oauthControllor.kakaoLogout)
router.get('/kakao/status', isKakaoRefreshToken, oauthControllor.refreshAccessToken)
// router.delete('/kakao/delete-account')

module.exports = router
