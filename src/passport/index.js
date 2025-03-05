const passport = require('passport')
const User = require('../models/userModels/user')
const local = require('./localStrategy')

module.exports = () => {
   passport.serializeUser((user, done) => {
      done(null, user.id)
   })

   passport.deserializeUser((id, done) => {
      User.findOne({ where: { id } })
         .then((user) => {
            done(null, user)
         })
         .catch((err) => {
            console.error('❌ 유저 조회 실패:', err.message)
            done(err)
         })
   })
   local()
}
