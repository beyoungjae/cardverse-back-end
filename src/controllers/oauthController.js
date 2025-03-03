const kakaoService = require('../services/kakaoService')
const { authService } = require('../services/authService')
const { oauthService } = require('../services/oauthService')
const logger = require('../config/logger')
const { kakaoAuth } = require('../services/oauthProviders')
const { transformAuthResponse } = require('../utils/responseHelper')
const jwt = require('jsonwebtoken')
const axios = require('axios')

/**
 * 카카오 OAuth 로그인 처리
 *
 * 1. 프론트엔드에서 받은 `code`를 사용하여 카카오 API에서 액세스 토큰을 발급받음.
 * 2. 발급받은 토큰(`getToken`)을 사용하여 카카오에서 사용자 정보를 조회함.
 * 3. 조회한 사용자 정보에서 `providerUserId`(OAuth의 고유 사용자 ID)를 추출함.
 * 4. 기존에 등록된 사용자(`userData`)가 있는지 확인하여, 없으면 생성하고 있으면 업데이트함.
 * 5. 로그인 이력을 저장함 (`recordLoginHistory`).
 * 6. 최종적으로 `userData`를 응답으로 반환하여 프론트에서 사용 가능하도록 함.
 *
 * @param {Object} req - Express 요청 객체 (body에 `code` 포함)
 * @param {string} req.body.code - 카카오 로그인 시 프론트에서 받은 `인가 코드`
 * @param {Object} res - Express 응답 객체
 *
 * @const {string} provider - OAuth 제공자 (예: 'kakao', 'google' 등)
 * @const {Object} getToken - `code`를 통해 발급받은 OAuth 토큰 객체 (액세스/리프레시 토큰 포함)
 * @const {string} providerUserId - `[getToken.idToken]`을 디코딩해서 얻은 OAuth의 고유 사용자 ID
 * @var {Object} userData - `[getToken]`을 기반으로 DB에서 조회한 사용자 정보 객체 (없으면 생성, 있으면 업데이트)
 *
 * @return {Promise<Object>} - 최종적으로 프론트에 전달할 사용자 정보
 * @throws {Error} - 로그인 처리 중 발생한 에러
 */

exports.kakaoLogin = async (req, res, next) => {
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
         const virtualEmail = oauthService.generateVirtualEmail(provider, providerUserId)

         userData = await oauthService.createUser(provider, providerUserId, virtualEmail, getToken) // ✅ 유저 생성
      } else {
         // 4-2. 유저정보가 있을시 정보 업데이트후 반환
         userData = await oauthService.updateUser(userData, provider, getToken)
      }

      // 5. 위에서 업데이트된 유저정보를 기반으로 로그인 이력 기록
      await authService.recordLoginHistory(req, provider, userData)

      // 6. 리프레시 토큰을 HttpOnly Secure 쿠키에 저장
      res.cookie('refreshToken', getToken.refreshToken, {
         httpOnly: true, // XSS 공격 방어
         secure: process.env.NODE_ENV === 'production', // HTTPS에서만 사용
         sameSite: 'Strict', // CSRF 방어
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      })

      req.session.loginType = 'oauth'
      req.session.user = userData.user

      return res.status(200).json(userData)
   } catch (error) {
      logger.error('로그인 처리 중 오류 발생:', error)
      if (next) {
         next(error) // 에러 처리 미들웨어로 전달
      } else {
         return res.status(500).json({
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다.',
            error: error.message
         });
      }
   }
}

exports.refreshAccessToken = async (req, res) => {
   const refreshToken = req.refreshToken
   const user = req.user
   try {
      logger.info(user)
      const provider = 'kakao'

      const fetchAccessToken = await oauthService.fetchAccessToken(refreshToken)
      const providerUserId = await kakaoAuth.getProviderUserId(fetchAccessToken)

      const responseData = transformAuthResponse(user, fetchAccessToken, provider, providerUserId)

      return res.status(200).json(responseData)
   } catch (error) {
      console.error('Access토큰 재발급 중 오류 발생:', error)
      next(error)
   }
}

exports.kakaoLogout = async (req, res) => {
   const userId = req.user.id
   const provider = req.user.provider
   console.log('로그아웃, user:', req.user)
   console.log('로그아웃, userId:', req.user.id)
   console.log('로그아웃, provider:', req.user.provider)
   try {
      await oauthService.logoutUser(userId, provider)
      await oauthService.clearSessionCookies(req, res)

      return res.status(200).json({
         success: true,
         message: '로그아웃 성공',
         user: {},
      })
   } catch (error) {
      console.error('OAuth 로그아웃 중 오류 발생:', error)
      next(error)
   }
}

// 6. 기록하고난 후 최대 30개 로그인 이력 가져옴
// const getLoginHistory = await authService.getLoginHistory(userData)
// loginHistory: [...getLoginHistory],
