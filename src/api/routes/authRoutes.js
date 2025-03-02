const logger = require('../../config/logger')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const { isLoggedIn, isNotLoggedIn, checkProvider } = require('../middlewares/isAuth')
const User = require('../../models/userModels/user') // User 모델 import
const { validLogin, validSignup } = require('../middlewares/validators')
const authController = require('../../controllers/authController')

router.post('/login', isNotLoggedIn, validLogin, authController.login)
router.post('/signup', isNotLoggedIn, validSignup, authController.signup)

//로그아웃 localhost:8000/auth/logout
router.get('/logout', isLoggedIn, async (req, res, next) => {
   console.log(req)
   req.logout((error) => {
      if (error) {
         console.log(error)

         return res.status(500).json({
            success: false,
            message: '로그아웃 중 오류가 발생했습니다.',
            error: error,
         })
      }

      res.json({
         success: true,
         message: '로그아웃에 성공했습니다.',
      })
   })
})

//로그아웃 localhost:8000/auth/logout
router.get('/logout', checkProvider, async (req, res, next) => {
  
   
    if (provider === 'local') {
       return authController.logout(req, res, next)
    } else if (provider === 'kakao') {
       return oauthController.kakaoLogout(req, res, next)
    } else {
       return res.status(400).json({
          success: false,
          message: '알 수 없는 로그인 유형입니다. 다시 로그인해 주세요.',
       })
    }
})

//로그인 상태 확인 localhost:8000/auth/status
router.get('/status', async (req, res, next) => {
   console.log('passporot isAuth체크:', req.isAuthenticated())
   if (req.isAuthenticated()) {
      res.json({
         isAuthenticated: true,
         user: {
            id: req.user.id,
            email: req.user.email,
            nick: req.user.nick,
            role: req.user.role,
            provider: 'local',
         },
      })
   } else {
      //로그인이 되지 않았을때
      res.json({
         isAuthenticated: false,
      })
   }
})

module.exports = router
