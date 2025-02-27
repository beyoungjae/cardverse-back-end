const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const User = require('../models/userModels/user')
const OauthAccount = require('../models/userModels/oauthAccount')
const LoginHistory = require('../models/userModels/loginHistory')
const AppError = require('../utils/AppError')

// 유틸
const { snakeToCamel } = require('../utils/caseConverter')
const { UTCtoKST, getCurrentKST, formatDate } = require('../utils/timezoneUtil')
const { responseOAuthData } = require('../utils/responseHelper')

class OAuthService {
   constructor(strategy) {
      this.strategy = strategy
   }

   // 1. oauth의 유저 ID(providerUserId) 가져오기
   async getProviderUserId(token) {
      // 인증 전략 유효 검증
      if (!this.strategy) {
         logger.error('인증 전략에 실패')
         throw new AppError('인증 전략(strategy)가 설정되지 않았습니다. 전략을 주입해주세요', 400)
      }

      // 주입된 strategy를 사용하여 각 OAuth 제공자의 유저 ID(providerUserId)를 가져옴. (의존성 주입 방식)
      return await this.strategy.getProviderUserId(token)
   }

   // 2. [provider, providerUserId]를 통해 [oauthAccount]Table 유저 정보 조회
   async getOAuthUser(provider, providerUserId) {
      try {
         const exUser = await OauthAccount.findOne({
            where: { provider, providerUserId },
            include: [
               {
                  model: User, // User 모델을 포함시킴
               },
            ],
         })
         // 여기까지 check OK
         const user = exUser.User

         const responseData = responseOAuthData(user, exUser, provider, providerUserId)

         return responseData // ✅ 조회된 유저 정보 반환
      } catch (error) {
         logger.error('OAuth 사용자 조회 중 오류 발생:', error.message) // 자동으로 error.stack 포함
         throw new Error(`OAuth 사용자 정보를 가져오는 중 오류가 발생했습니다. ${error.message}`)
      }
   }

   // 3. oauth 유저 생성로직
   // 3-1. oauthAccount 정보가 없다면 가상 메일 생성
   async generateVirtualEmail(provider, providerUserId) {
      return `${provider}${providerUserId}@temp.com`
   }

   // 3-2. oauth정보 및 가상메일로 [User]Table에 유저 생성 => [oauthAccount]Table 생성후 연동
   async createUser(provider, providerUserId, virtualEmail, getToken) {
      try {
         // 1. [User]Table 유저 생성
         // 1-1. 임시 닉네임 생성
         const tempNick = `${provider}_${providerUserId}`
         const newUser = await User.create({
            email: virtualEmail,
            nick: tempNick,
         })

         // 1-2. 유저 ID 기반 닉네임 업데이트
         await newUser.reload()
         const setNick = `회원_${newUser.id}` // 유저 고유식별자 노출을 방어
         await newUser.update({ nick: setNick }) // 새 닉네임 업데이트

         // 2. [OauthAccount]Table 등록 및 연동
         const newOauthUser = await OauthAccount.create({
            user_id: newUser.id,
            provider,
            providerUserId,
            accessToken: getToken.accessToken,
            refreshToken: getToken.refreshToken,
            tokenExpiresAt: formatDate(getToken.expiresIn),
         })

         return {
            status: 'success',
            message: '회원가입이 완료되었습니다.',
            user: {
               id: newUser.id,
               email: newUser.email,
               nick: newUser.nick,
               provider,
            },
            token: {
               accessToken: newOauthUser.accessToken, // ✅ JWT 토큰 반환
               tokenExpiresAt: newOauthUser.tokenExpiresAt, // (선택 사항) 만료 시간 제공
            },
         }
      } catch (error) {
         logger.error('OAuth 사용자 생성 중 오류 발생:', error) // 자동으로 error.stack 포함
         throw new Error(`OAuth 사용자 등록 중 문제가 발생했습니다: ${error.message}`)
      }
   }

   // 4. [oauthAccount]Table 업데이트
   async updateUser(userData, provider, getToken) {
      try {
         const userId = userData.user.id
         const providerUserId = userData.user.providerUserId

         const updateToken = await OauthAccount.update(
            {
               accessToken: getToken.accessToken, // 업데이트할 필드
               refreshToken: getToken.refreshToken, // 업데이트할 필드
               tokenExpiresAt: formatDate(getToken.expiresIn),
               updatedAt: formatDate(),
            },
            {
               where: { user_id: userId, provider }, // 조건
            },
         )

         if (updateToken[0] === 1) {
            logger.info('토큰 업데이트 성공했습니다.')
         }

         const updateUserData = await OauthAccount.findOne({
            where: { provider, providerUserId },
            include: [
               {
                  model: User, // User 모델을 포함시킴
               },
            ],
         })

         const user = updateUserData.User

         const responseData = responseOAuthData(user, updateUserData, provider, providerUserId)

         return responseData
      } catch (error) {
         logger.error('kakao 사용자 정보 업데이트중 오류가 발생했습니다.', error) // 자동으로 error.stack 포함
         throw new Error(`kakao 사용자 정보 업데이트중 오류가 발생했습니다. ${error.message}`)
      }
   }
}

const oauthServiceInstance = new OAuthService()

module.exports = {
   oauthService: oauthServiceInstance, // ✅ 싱글톤
   OAuthService, // ✅ 개별 인스턴스 생성 가능
}
