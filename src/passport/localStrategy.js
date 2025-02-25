const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/userModels').User

module.exports = () => {
   passport.use(
      new LocalStrategy(
         {
            usernameField: 'email',
            passwordField: 'password',
         },
         async (email, password, done) => {
            try {
               const exUser = await User.findOne({ where: { email } })

               if (exUser) {
                  const result = await bcrypt.compare(password, exUser.password)

                  if (result) {
                     done(null, exUser)
                  } else {
                     done(null, false, { message: '비밀번호가 일치하지 않습니다.' })
                  }
               } else {
                  done(null, false, { message: '가입정보가 존재하지 않습니다.' })
               }
            } catch (error) {
               console.error(error)
               done(error)
            }
         },
      ),
   )
}
