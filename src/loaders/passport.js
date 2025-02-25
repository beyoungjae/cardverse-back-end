const passport = require('passport')
const passportConfig = require('../passport')

async function passportLoader(app) {
   try {
      app.use(passport.initialize())
      app.use(passport.session())
      passportConfig()
   } catch (error) {
      console.error('❌ 패스포트 초기화 실패:', error)
      throw error
   }
}

module.exports = passportLoader
