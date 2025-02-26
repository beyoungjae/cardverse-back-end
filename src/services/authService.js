const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const User = require('../models/userModels/user')
const OauthAccount = require('../models/userModels/oauthAccount')
const LoginHistory = require('../models/userModels/loginHistory')

class AuthService {
   constructor() {}

   // it_token을 디코딩 => provider_user_id 추출
   async getProviderUserIdFromIdToken(id_token) {
      console.log(id_token)

      if (!id_token) throw new Error('id_token이 없습니다.')

      const decoded = jwt.decode(id_token)
      if (!decoded || !decoded.sub) throw new Error('id_token에 sub 값이 없습니다.')

      logger.info(decoded)

      return decoded.sub
   }

   // 소셜로그인시 계정 확인 및 생성
   async findOrCreateUser({ tokenData, virtualEmail }) {
      logger.info(tokenData)
      logger.info(virtualEmail)

      if (!tokenData) {
         logger.error('tokenData가 없습니다')
         throw new Error('tokenData가 없습니다.')
      }

      const [oauthAccount, created] = await OauthAccount.findOrCreate({
         where: {
            provider: tokenData.provider,
            providerUserId: tokenData.providerUserId,
         },
         include: [
            {
               model: User,
               foreignKey: 'user_id',
            },
         ],
         defaults: {
            // 새로 생성될 때만 적용되는 값들
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            tokenExpiresAt: tokenData.tokenExpiresAt,
         },
      })

      logger.debug(oauthAccount)
      logger.debug(created)

      if (created) {
         // 새 계정일 경우
         const userCount = await User.count()
         const defaultNick = `회원${userCount + 1}`

         // User 생성
         const user = await User.create({
            email: virtualEmail,
            nick: defaultNick,
            role: 'user',
            status: 'active',
         })

         // user_id만 업데이트 (나머지는 defaults에서 이미 설정됨)
         await oauthAccount.update({
            user_id: user.id,
         })
      } else {
         // 기존 계정이면 토큰 정보 업데이트
         await oauthAccount.update({
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            tokenExpiresAt: tokenData.tokenExpiresAt,
         })
      }

      const fullOauthAccount = await OauthAccount.findOne({
         where: {
            provider: tokenData.provider,
            providerUserId: tokenData.providerUserId,
         },
         include: [
            {
               model: User,
               foreignKey: 'user_id',
            },
         ],
      })

      return {
         oauthAccount: fullOauthAccount,
         created,
         isDefaultNick: created,
      }
   }

   // 소셜 로그인시 가상 이메일 생성
   async generateVirtualEmail(provider, oauthUserId) {
      return `${provider}${oauthUserId}@temp.com`
   }

   async recordLoginHistory({ loginData, userId }) {
      logger.info('로그인 히스토리 기록 시작:', { userId, loginData })

      try {
         const loginHistory = await LoginHistory.create({
            userId: userId,
            loginType: loginData.loginType,
            ipAddress: loginData.ipAddress,
            userAgent: loginData.userAgent,
         })

         logger.info('로그인 히스토리 기록 완료:', loginHistory)
         return loginHistory
      } catch (error) {
         logger.error('로그인 히스토리 기록 실패:', error)
         throw error
      }
   }

   async getLoginHistory(userId) {
      try {
         const loginHistory = await LoginHistory.findOne({
            where: { userId },
            order: [['loginAt', 'DESC']], // 최신 로그인 기록
         })

         // logger.debug('loginHistory:', loginHistory)
         return loginHistory
      } catch (error) {
         logger.error('로그인 히스토리 조회 실패:', error)
         throw error
      }
   }

   // 포맷 oauth 리스폰데이터
   async formatOAuthResponse({ oauthData, loginHistory }) {
      try {
         const { oauthAccount, created, isDefaultNick } = oauthData

         return {
            success: true,
            message: created ? '새로운 계정이 생성되었습니다.' : '로그인 성공',
            data: {
               user: {
                  id: oauthAccount.User.id,
                  email: oauthAccount.User.email,
                  nick: oauthAccount.User.nick,
                  role: oauthAccount.User.role,
               },
               accessToken: oauthAccount.accessToken,
               isNewUser: created,
               isDefaultNick,
               notifications: {
                  shouldChangeNickname: isDefaultNick,
                  nicknameMessage: isDefaultNick ? '프로필에서 닉네임을 변경해주세요.' : null,
               },
               loginHistory,
            },
         }
      } catch (error) {
         logger.error('OAuth 응답 데이터 포맷 실패:', error)
         throw new Error('로그인 응답 처리 중 오류가 발생했습니다.')
      }
   }
}

module.exports = new AuthService()
