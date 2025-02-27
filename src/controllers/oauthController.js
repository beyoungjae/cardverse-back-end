const kakaoService = require('../services/kakaoService')
const { authService } = require('../services/authService')
const { oauthService } = require('../services/oauthService')
const logger = require('../config/logger')
const { kakaoAuth } = require('../services/oauthProviders')

exports.kakaoLogin = async (req, res) => {
   try {
      const { code } = req.body
      const provider = 'kakao'

      // 1. 프론트에서 받은 코드 => 카카오에 전달해서 토큰받기
      const getToken = await kakaoService.getTokenKakao(code)

      // 2. 토큰데이터를 통해 카카오 유저정보 조회 => 프로바이더 유저 아이디 받기
      const providerUserId = await kakaoAuth.getProviderUserId(getToken)

      // 3. 프로바이더 유저 아이디로 oauthAccount 조회 (유저정보를 동적으로 변환)
      let userData = await oauthService.getOAuthUser(provider, providerUserId)

      // 4. 유저 정보 로직에따른 데이터 수정
      if (!userData) {
         // 4-1. 유저가 없을시 가상메일 및 유저 생성후 반환
         const virtualEmail = await oauthService.generateVirtualEmail(provider, providerUserId)

         userData = await oauthService.createUser(provider, providerUserId, virtualEmail, getToken) // ✅ 유저 생성
      } else {
         // 4-2. 유저정보가 있을시 정보 업데이트후 반환
         userData = await oauthService.updateUser(userData, provider, getToken)
      }

      // 5. 위에서 업데이트된 유저정보를 기반으로 로그인 이력 기록
      await authService.recordLoginHistory(provider, req, userData, getToken)

      // 6. 기록하고난 후 최대 30개 로그인 이력 가져옴
      const getLoginHistory = await authService.getLoginHistory(userData)

      // 7. 필터된 유저정보와 로그인이력을 합치고 프론트에 반환
      const responseData = {
         ...userData,
         loginHistory: {
            getLoginHistory,
         },
      }

      return res.status(200).json(responseData)
   } catch (error) {
      logger.error('로그인 처리 중 오류 발생:', error)
      next(error) // 에러 처리 미들웨어로 전달
   }
}
