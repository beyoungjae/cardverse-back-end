const logger = require('../config/logger')
const authService = require('./authService')

class KakaoService {
   constructor(axiosInstance = require('axios')) {
      this.axios = axiosInstance
      this.KAKAO_AUTH_URL = process.env.KAKAO_AUTH_URL || 'https://kauth.kakao.com/oauth/token'
      this.KAKAO_USER_INFO_URL = 'https://kapi.kakao.com/v2/user/me'
      this.KAKAO_MAP_URL = 'https://dapi.kakao.com/v2/local/geo/coord2address.json'
   }

   // ✅ 카카오 OAuth 토큰 요청
   async getTokenKakao(code) {
      console.log('카카오서비스 겟토큰카카오 code:', code)
      try {
         logger.debug('getToken', code)
         let response = await this.axios.post(this.KAKAO_AUTH_URL, null, {
            params: {
               grant_type: 'authorization_code',
               client_id: process.env.KAKAO_CLIENT_ID,
               redirect_uri: process.env.KAKAO_REDIRECT_URI || 'http://localhost:3000/login',
               code: code,
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         })
         //  logger.debug(response)
         console.log('response 체크:', response.data)

         response.data // 원본데이터

         return response.data
      } catch (error) {
         console.error('🚨 카카오 토큰 요청 실패:', error.response ? error.response.data : error.message)
         throw new Error('카카오 토큰 요청 실패')
      }
   }

   async transformKakaoTokenData(responseData) {
      const idToken = responseData['id_token']
      const providerUserId = await authService.getProviderUserIdFromIdToken(idToken)

      let tokenData = {
         ...responseData,
         providerUserId,
         provider: 'kakao',
         tokenExpiresAt: new Date(Date.now() + responseData.expires_in * 1000),
      }
      delete tokenData.token_type
      delete tokenData.expires_in
      delete tokenData.id_token
      delete tokenData.refresh_token_expires_in

      tokenData.accessToken = tokenData.access_token
      tokenData.refreshToken = tokenData.refresh_token
      delete tokenData.access_token
      delete tokenData.refresh_token

      logger.info(tokenData)
      const accessToken = tokenData.accessToken

      return { tokenData, accessToken }
   }

   // ✅ 카카오 사용자 정보 조회
   async getKakaoUserInfo(accessToken) {
      logger.debug(accessToken)
      try {
         const response = await this.axios.get(this.KAKAO_USER_INFO_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
         })

         return response.data
      } catch (error) {
         throw new Error('카카오 사용자 정보 조회 실패')
      }
   }

   // ✅ 카카오 지도 API: 좌표 → 주소 변환
   async getAddressFromCoords(longitude, latitude) {
      try {
         const response = await this.axios.get(this.KAKAO_MAP_URL, {
            params: { x: longitude, y: latitude },
            headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
         })

         return response.data
      } catch (error) {
         throw new Error('카카오 지도 주소 변환 실패')
      }
   }

   // ✅ 카카오 지도 API: 키워드 장소 검색
   async searchPlaces(query, longitude, latitude) {
      try {
         const response = await this.axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
            params: {
               query,
               x: longitude,
               y: latitude,
               radius: 1000,
            },
            headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
         })

         return response.data
      } catch (error) {
         throw new Error('카카오 장소 검색 실패')
      }
   }
}

module.exports = new KakaoService()
