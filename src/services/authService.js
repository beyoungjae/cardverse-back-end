const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const User = require('../models/userModels/user')
const OauthAccount = require('../models/userModels/oauthAccount')
const LoginHistory = require('../models/userModels/loginHistory')
const { cleanLoginData } = require('../utils/requestUtils')
const { sequelize } = require('../models')

class AuthService {
   constructor() {}

   async recordLoginHistory(provider, req, userData) {
      const transaction = await sequelize.transaction()
      const userId = userData.user.id
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
            { lastLogin: loginHistory.loginAt }, // 생성된 loginAt 값을 사용
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
