const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const User = require('../models/userModels/user')
const OauthAccount = require('../models/userModels/oauthAccount')
const LoginHistory = require('../models/userModels/loginHistory')
const { cleanLoginData } = require('../utils/requestUtils')
const { sequelize } = require('../models')
const passport = require('passport')
const { formatDate } = require('../utils/timezoneUtil')
const { Op } = require('sequelize')

class AuthService {
   constructor() {}

   async login(email, password) {
      return new Promise((resolve, reject) => {
         passport.authenticate('local', async (authError, user, info) => {
            if (authError) return reject(authError)
            if (!user) return reject({ status: 401, message: info?.message || '이메일 또는 비밀번호가 일치하지 않습니다.' })

            resolve(user) // 로그인 성공 시 유저 데이터 반환
         })({ body: { email, password } })
      })
   }

   async getUserData(email, nick) {
      try {
         const existingUser = await User.findOne({
            where: {
               [Op.or]: [{ email }, { nick }],
            },
         })

         return existingUser
      } catch (error) {
         console.error('회원 조회중 오류가 발생하였습니다.', error)
         throw new Error('회원 조회중 오류가 발생하였습니다.')
      }
   }

   async recordLoginHistory(req, provider, userData) {
      const transaction = await sequelize.transaction()
      const userId = userData?.id || userData?.user?.id
      // const userId = userData.user.id
      const loginData = cleanLoginData(req, provider)

      try {
         const loginHistory = await LoginHistory.create(
            {
               userId: userId,
               loginType: provider,
               ipAddress: loginData.ipAddress,
               userAgent: loginData.userAgent,
            },
            { transaction },
         )

         await User.update(
            { lastLogin: formatDate() }, // 생성된 loginAt 값을 사용
            { where: { id: userId }, transaction },
         )

         await transaction.commit()
         await loginHistory.reload()
      } catch (error) {
         logger.error('로그인 이력 기록중 오류가 발생했습니다.', error.message)
         throw new Error('로그인 이력 기록중 오류가 발생했습니다.')
      }
   }

   async getLoginHistory(userData) {
      const userId = userData.user.id
      try {
         const loginHistory = await LoginHistory.findAll({
            attributes: ['id', 'loginType', 'ipAddress', 'userAgent', 'loginAt', 'userId'], // 필요한 필드만 선택
            where: { userId: userId },
            order: [['loginAt', 'DESC']], // 최신 로그인 기록
            limit: 30, // 최대 30개 이력까지
         })

         return loginHistory
      } catch (error) {
         logger.error('로그인 히스토리 조회 실패:', error.message)
         throw error
      }
   }
}

const authServiceInstance = new AuthService()

module.exports = {
   authService: authServiceInstance, // ✅ 싱글톤
   AuthService, // ✅ 개별 인스턴스 생성 가능
}
