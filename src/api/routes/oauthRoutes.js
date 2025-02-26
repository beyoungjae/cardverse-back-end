const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../../models/userModels/user')

// 카카오 로그인
router.get('/kakao', passport.authenticate('kakao'))

// router.post(
//    '/kakao',
//    passport.authenticate('kakao', {
//       failureRedirect: '/',
//    }),
// )

// router.post('/kakao/callback', async (req, res) => {
//    console.log('받은 데이터:', req.body)
//    res.json({ success: true, message: '콜백 도달' })
// })

router.post(
   '/kakao',
   (req, res, next) => {
      console.log('카카오 인증 시작:', req.body)
      next()
   },
   passport.authenticate('kakao', {
      failureRedirect: '/',
   }),
   (req, res) => {
      console.log('카카오 인증 성공:', req.user)
      res.json({
         success: true,
         user: req.user,
      })
   },
)

// router.post(
//    '/kakao',
//    passport.authenticate('kakao', {
//       failureRedirect: '/',
//    }),
//    async (req, res) => {
//       try {
//          // lastLogin 업데이트
//          await User.update({ lastLogin: new Date() }, { where: { id: req.user.id } })

//          const userInfo = {
//             id: req.user.id,
//             email: req.user.email,
//             nick: req.user.nick,
//             role: req.user.role,
//          }

//          res.json({
//             success: true,
//             message: '카카오 로그인 성공',
//             user: userInfo,
//          })
//       } catch (error) {
//          console.error('카카오 콜백 처리 에러:', error)
//          res.status(500).json({
//             success: false,
//             message: '로그인 처리 중 오류가 발생했습니다.',
//          })
//       }
//    },
// )

module.exports = router
