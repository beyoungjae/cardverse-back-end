const User = require('../models/userModels/user')
const OauthAccount = require('../models/userModels/oauthAccount')
const axios = require('axios')
const logger = require('../config/logger')

const oauthConfig = require('../config/oauthConfig')

// 유틸
const { snakeToCamel } = require('../utils/caseConverter')
const { formatDate } = require('../utils/timezoneUtil')
const { transformAuthResponse } = require('../utils/responseHelper')

class OAuthService {
   constructor(provider) {
      this.provider = provider
      this.config = oauthConfig[provider] || null
      this.axios = axios
      this.strategy = this.config?.strategy
   }

   // access token 요청
   async getAccessToken(code) {
      try {
         let response = await this.axios.post(this.config.authUrl, null, {
            params: {
               grant_type: 'authorization_code',
               client_id: this.config.clientId,
               redirect_uri: this.config.redirectUri,
               code: code,
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         })

         return snakeToCamel(response.data)
      } catch (error) {
         console.error(`🚨 ${this.provider} 토큰 요청 실패:`, error.response ? error.response.data : error.message)
         throw new Error(`${this.provider} 토큰 요청 실패`)
      }
   }

   // OAuth 유저 정보 요청
   async getProviderUserId(token) {
      if (!this.strategy) {
         throw new Error('🚨 인증 전략(strategy)가 설정되지 않았습니다.')
      }
      return await this.strategy.getProviderUserId(token)
   }

   // [provider, providerUserId]를 통해 [oauthAccount]Table 유저 정보 조회
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
         if (!exUser) {
            return null
         } else {
            const user = exUser?.User

            const responseData = transformAuthResponse({ success: true, user, token: exUser, provider })

            return responseData // 조회된 유저 정보 반환
         }
      } catch (error) {
         console.error('OAuth 사용자 조회 중 오류 발생:', error.message)
         throw new Error(`OAuth 사용자 정보를 가져오는 중 오류가 발생했습니다. ${error.message}`)
      }
   }

   generateVirtualEmail(provider, providerUserId) {
      return `${provider}${providerUserId}@temp.com`
   }

   async createUser(provider, providerUserId, virtualEmail, getToken) {
      try {
         const tempNick = `${provider}_${providerUserId}`
         const newUser = await User.create({
            email: virtualEmail,
            nick: tempNick,
         })

         await newUser.reload()

         const setNick = `회원_${newUser.id}`

         await newUser.update({ nick: setNick })

         const newOauthUser = await OauthAccount.create({
            user_id: newUser.id,
            provider,
            providerUserId,
            accessToken: getToken.accessToken,
            refreshToken: getToken.refreshToken,
            tokenExpiresAt: formatDate(getToken.expiresIn),
         })
         return transformAuthResponse({
            success: true,
            user: newUser,
            token: {
               accessToken: newOauthUser.accessToken,
               tokenExpiresAt: newOauthUser.tokenExpiresAt,
            },
            provider,
            message: '회원가입에 성공했습니다.',
         })
      } catch (error) {
         console.error('OAuth 사용자 생성 중 오류 발생:', error)
         throw new Error(`OAuth 사용자 등록 중 문제가 발생했습니다: ${error.message}`)
      }
   }

   async updateUser(userData, provider, token, providerUserId) {
      try {
         const userId = userData.user.id

         const updateToken = await OauthAccount.update(
            {
               accessToken: token.accessToken,
               refreshToken: token.refreshToken,
               tokenExpiresAt: formatDate(token.expiresIn),
               updatedAt: formatDate(),
            },
            {
               where: { user_id: userId, provider },
            },
         )

         if (updateToken[0] === 1) {
            logger.info('토큰 업데이트 성공했습니다.')
         }

         const updateUserData = await OauthAccount.findOne({
            where: { provider, providerUserId },
            include: [
               {
                  model: User,
               },
            ],
         })

         const user = updateUserData.User

         const responseData = transformAuthResponse({ success: true, user, token: updateUserData, provider, message: '로그인에 성공하였습니다.' })

         return responseData
      } catch (error) {
         console.error('kakao 사용자 정보 업데이트중 오류가 발생했습니다.', error)
         throw new Error(`kakao 사용자 정보 업데이트중 오류가 발생했습니다. ${error.message}`)
      }
   }

   checkToken(frontUser, backUser) {
      if (frontUser.accessToken === backUser.accessToken) {
         return transformAuthResponse({
            success: true,
            user: frontUser,
            token: {
               accessToken: frontUser.accessToken,
               tokenExpiresAt: 3600,
            },
            provider: frontUser.provider,
            message: '유효한 토큰입니다.',
         })
      }

      return { success: false }
   }

   async clearToken(userId, provider) {
      try {
         const clear = await OauthAccount.update(
            {
               refreshToken: null,
            },
            {
               where: { user_id: userId, provider },
            },
         )
      } catch (error) {
         console.error('사용자 토큰 제거중 오류 발생', error)
         throw new Error(`사용자 토큰 제거중 오류 발생, ${error.message}`)
      }
   }

   async fetchToken(refreshToken) {
      try {
         const response = await axios.post('https://kauth.kakao.com/oauth/token', null, {
            params: {
               grant_type: 'refresh_token',
               client_id: process.env.KAKAO_CLIENT_ID,
               refresh_token: refreshToken,
            },
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
         })

         return snakeToCamel(response.data)
      } catch (error) {
         console.error('accessToken 재발급 실패', error)
         throw new Error('accessToken 재발급 오류가 발생했습니다.', 400)
      }
   }
}

const oauthServiceInstance = new OAuthService(null)

// provider별로 생성된 OAuth 인스턴스
const oauthServices = {
   kakao: new OAuthService('kakao'),
   google: new OAuthService('google'),
   naver: new OAuthService('naver'),
   github: new OAuthService('github'),
   facebook: new OAuthService('facebook'),
}

// 특정 provider가 있으면 해당 인스턴스를 반환, 없으면 공통 인스턴스를 반환
function getOAuthService(provider = null) {
   if (!provider) {
      return oauthServiceInstance // 공통 인스턴스 반환
   }

   // provider가 `oauthServices`에 없으면 새로 생성하여 저장 후 반환
   if (!oauthServices[provider]) {
      console.warn(`⚠️ ${provider} OAuth 인스턴스가 존재하지 않아 새로 생성합니다.`)
      oauthServices[provider] = new OAuthService(provider)
   }

   return oauthServices[provider]
}

// 최종 내보내기
module.exports = {
   oauthService: oauthServiceInstance, // 공통 함수 사용을 위한 싱글톤 인스턴스
   getOAuthService, // 특정 provider가 필요하면 가져오기
   OAuthService, // 개별 인스턴스 생성 가능 (직접 사용 가능)
}
