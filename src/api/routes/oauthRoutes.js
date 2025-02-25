const router = require('express').Router()
const passport = require('passport')

// 카카오 로그인
router.get('/kakao', passport.authenticate('kakao'))

// 카카오 콜백
router.get(
   '/kakao/callback',
   passport.authenticate('kakao', {
      failureRedirect: '/',
   }),
   (req, res) => {
      const userInfo = {
         id: req.user.id,
         email: req.user.email,
         nick: req.user.nick,
         role: req.user.role,
      }

      res.json({
         success: true,
         message: '카카오 로그인 성공',
         user: userInfo,
      })
   },
)

module.exports = router
