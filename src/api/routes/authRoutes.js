const logger = require('../../config/logger')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/isAuth')
const User = require('../../models/userModels/user') // User 모델 import

// 1. 회원가입 (localhost:8000/auth/signup)
router.post('/signup', isNotLoggedIn, async (req, res, next) => {
   const { email, password, nick, signupType, referralEmail } = req.body
   try {
      const exUser = await User.findOne({ where: { email } })

      if (exUser) {
         return res.status(409).json({
            success: false,
            message: '이미 존재하는 사용자입니다.',
         })
      }

      const exNick = await User.findOne({ where: { nick } })

      if (exNick) {
         return res.status(409).json({
            success: false,
            message: '이미 사용중인 닉네임입니다.',
         })
      }

      const hash = await bcrypt.hash(password, 12)

      const newUser = await User.create({
         email,
         password: hash,
         nick,
         role: 'user',
      })

      if (signupType === 'referral') {
         // 추천인 관련 쿠폰발급 등
         const referralUser = await User.findOne({ where: { email: referralEmail } })

         if (!referralUser) {
            return res.status(404).json({
               // 409보다 404가 더 적절
               success: false,
               message: '존재하지 않는 추천인입니다.',
            })
         }
         // 아직 미구현
      }

      // user데이터 객체로 변환후 패스워드 정보 제거
      const userWithoutPassword = newUser.toJSON()
      delete userWithoutPassword.password

      res.status(201).json({
         success: true,
         message: '사용자가 성공적으로 등록되었습니다.',
         user: userWithoutPassword,
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({
         success: false,
         message: '회원가입 중 오류가 발생했습니다.',
         error,
      })
   }
})

//로그인 localhost:8000/auth/login
router.post('/login', isNotLoggedIn, async (req, res, next) => {
   passport.authenticate('local', async (authError, user, info) => {
      if (authError) {
         console.error('Auth Error:', authError)
         return res.status(500).json({
            success: false,
            message: '인증 중 오류가 발생했습니다.',
         })
      }

      if (!user) {
         return res.status(401).json({
            success: false,
            message: info.message || '이메일 또는 비밀번호가 일치하지 않습니다.',
         })
      }

      req.login(user, async (loginError) => {
         if (loginError) {
            console.error('Login Error:', loginError)
            return res.status(500).json({
               success: false,
               message: '로그인 중 오류가 발생했습니다.',
            })
         }

         try {
            // lastLogin 업데이트 추가
            await User.update({ lastLogin: new Date() }, { where: { id: user.id } })

            const userInfo = {
               id: user.id,
               email: user.email,
               nick: user.nick,
               role: user.role,
            }

            res.json({
               success: true,
               message: '로그인 성공',
               user: userInfo,
            })
         } catch (error) {
            console.error('LastLogin Update Error:', error)
            // 로그인은 성공했으므로 에러를 던지지 않고 계속 진행
            res.json({
               success: true,
               message: '로그인 성공',
               user: userInfo,
            })
         }
      })
   })(req, res, next)
})

//로그아웃 localhost:8000/auth/logout
router.get('/logout', isLoggedIn, async (req, res, next) => {
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

//로그인 상태 확인 localhost:8000/auth/status
router.get('/status', async (req, res, next) => {
   if (req.isAuthenticated()) {
      res.json({
         isAuthenticated: true,
         user: {
            id: req.user.id,
            email: req.user.email,
            nick: req.user.nick,
            role: req.user.role,
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
