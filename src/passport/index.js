const passport = require('passport')
const User = require('../models/userModels/user')
const local = require('./localStrategy')
const kakao = require('./kakaoStrategy')

module.exports = () => {
   passport.serializeUser((user, done) => {
      done(null, user.id)
   })

   passport.deserializeUser((id, done) => {
      User.findOne({ where: { id } })
         .then((user) => done(null, user))
         .catch((err) => done(err))
   })
   local()
   kakao()
}
