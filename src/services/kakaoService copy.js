const axios = require('axios')
const logger = require('../config/logger')

const KAKAO_AUTH_URL = process.env.KAKAO_AUTH_URL || 'https://kauth.kakao.com/oauth/token'

exports.getTokenKakao = async (code) => {
   try {
      const response = await axios.post(KAKAO_AUTH_URL, null, {
         params: {
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_CLIENT_ID,
            redirect_uri: process.env.KAKAO_REDIRECT_URI || 'http://localhost:8000/oauth/kakao/callback',
            code: code,
         },
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      logger.info(`카카오 토큰 발급 성공: ${JSON.stringify(response.data)}`)
      return response.data
   } catch (error) {
      if (error.response) {
         const { status, data } = error.response
         logger.error(`카카오 토큰 요청 실패 (HTTP ${status}): ${JSON.stringify(data)}`)
         throw new Error(`카카오 토큰 요청 실패 (HTTP ${status}): ${data.error_description || data.error}`)
      } else {
         // 네트워크 에러 또는 기타 오류 처리
         logger.error(`카카오 토큰 요청 중 네트워크 오류: ${error.message}`)
         throw new Error('카카오 토큰 요청 중 네트워크 오류가 발생했습니다.')
      }
   }
}

exports.findOrCreateUser = async ()