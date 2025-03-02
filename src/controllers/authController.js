const logger = require('../config/logger')
const { authService } = require('../services/authService')
const passport = require('passport')
const { transformAuthResponse } = require('../utils/responseHelper')

exports.signup = async (req, res, next) => {
   try {
      const getUser = req.body

      await authService.exUser(getUser.email, getUser.nick)

      const newUser = await authService.createUser(getUser)

      return res.status(201).json(newUser)
   } catch (error) {
      console.error(error)

      // ✅ 추천인 이메일 오류 또는 중복된 경우 409 Conflict 응답
      if (error.message === '이미 사용 중인 이메일 또는 닉네임입니다.' || error.message.includes('추천인')) {
         return res.status(409).json({
            success: false,
            message: error.message,
         })
      }

      // ✅ 그 외 서버 오류 처리
      return res.status(500).json({
         success: false,
         message: '서버 오류가 발생했습니다.',
      })
   }
}

/**
 * 사용자 로그인 컨트롤러
 *
 * 사용자가 로그인하면 Passport를 이용해 인증하고, 세션을 설정한 후 응답을 반환합니다.
 *
 * @route POST /auth/login
 * @param {Object} req - Express 요청 객체
 * @param {Object} req.body - 클라이언트가 보낸 로그인 데이터
 * @param {string} req.body.email - 사용자의 이메일
 * @param {string} req.body.password - 사용자의 비밀번호
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express `next()` 함수
 * @returns {Object} JSON 응답 (사용자 정보 및 인증 토큰 포함)
 */

exports.login = async (req, res, next) => {
   try {
      // 로그인시 담고있는 정보
      const { email, password } = req.body

      // 로컬 로그인
      const provider = 'local'

      // passport를 통한 로그인 검증
      const user = await authService.login(email, password)

      // 로그인 이력 추가
      const updateUserLoginHistory = await authService.recordLoginHistory(req, provider, user)

      // response 할 일관된 데이터 형식으로 변환
      const responseUser = transformAuthResponse(updateUserLoginHistory, null, provider, null, '로그인 성공')

      // passport의 세션에 저장할 user정보 (req.user를 사용하기 위함)
      const serializeUser = responseUser.user

      req.session.loginType = 'local'
      
      // passport를 통해 세션에 user정보 저장 req.isAuthenticated()를 통해 검증 가능하게함
      req.login(serializeUser, async (loginError) => {
         if (loginError) {
            console.error('로그인 중 오류 발생:', loginError)
            return res.status(500).json({ success: false, message: '로그인 중 오류가 발생하였습니다.' })
         }

         // 최종적으로 클라이언트에 정보 전달
         return res.status(200).json(responseUser)
      })
   } catch (error) {
      console.error('❌ 로그인 실패:', error)
      return res.status(error.status || 500).json({ success: false, message: error.message })
   }
}

exports.logout = async (req, res, next) => {
   try {
      req.logout((error) => {
         if (error) {
            console.log(error)

            return res.status(500).json({
               success: false,
               message: '로그아웃 중 오류가 발생했습니다.',
               error: error,
            })
         }

         res.json({
            success: true,
            message: '로그아웃에 성공했습니다.',
         })
      })
   } catch (error) {}
}

exports.processOAuthLogin = async (oauthData, req, res) => {
   try {
      logger.debug('oauthData:', oauthData)

      const { created, oauthAccount } = oauthData
      const userId = oauthAccount.User.id

      const loginHistory = !created ? await authService.getLoginHistory(userId) : null

      const statusCode = oauthData.created ? 201 : 200

      const responseData = await authService.formatOAuthResponse({ oauthData, loginHistory })

      logger.info(responseData)
      res.status(statusCode).json(responseData)
   } catch (error) {
      throw error
   }
}

// exports.getMyProfile = async()
