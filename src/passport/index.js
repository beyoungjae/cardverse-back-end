const passport = require('passport')
const User = require('../models/userModels/user')
const local = require('./localStrategy')

module.exports = () => {
   passport.serializeUser((user, done) => {
      console.log('🔹 serializeUser 실행됨, 저장된 user.id:', user.id)
      done(null, user.id)
   })

   passport.deserializeUser((id, done) => {
      console.log('🔹 deserializeUser 실행됨, id:', id)
      User.findOne({ where: { id } })
         .then((user) => {
            console.log('✅ 유저 조회 성공:', user?.id)
            done(null, user)
         })
         .catch((err) => {
            console.error('❌ 유저 조회 실패:', err.message)
            done(err)
         })
   })
   local()
}
