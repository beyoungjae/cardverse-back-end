const passport = require('passport')
const logger = require('../config/logger')
const User = require('../models/userModels/user')

exports.localLogin = async (email, password, req) => {
   return new Promise((resolve, reject) => {
      passport.authenticate('local', async (authError, user, info) => {
         if (authError) {
            return resolve({
               success: false,
               message: '인증 중 오류가 발생했습니다.',
               status: 500,
            })
         }

         if (!user) {
            return resolve({
               success: false,
               message: info.message || '이메일 또는 비밀번호가 일치하지 않습니다.',
               status: 401,
            })
         }

         // ✅ req.login을 PassportService에서 실행하도록 변경
         req.login(user, async (loginError) => {
            if (loginError) {
               console.error('Login Error:', loginError)
               return resolve({
                  success: false,
                  message: '로그인 중 오류가 발생했습니다.',
                  status: 500,
               })
            }

            try {
               await User.update({ lastLogin: new Date() }, { where: { id: user.id } })

               const formatUser = {
                  id: user.id,
                  email: user.email,
                  nick: user.nick,
                  role: user.role,
               }
            } catch (error) {}

            logger.debug('로그인 성공! user data:', user)

            return resolve({
               success: true,
               message: '로그인 성공!',
               user,
               status: 200,
            })
         })
      })({ body: { email, password } })
   })
}
