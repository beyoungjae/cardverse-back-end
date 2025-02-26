const kakaoService = require('../services/kakaoService')
const authService = require('../services/authService')
const logger = require('../config/logger')
const { cleanLoginData } = require('../utils/requestUtils')
const authController = require('./authController')

exports.kakaoCallback = async (req, res) => {
   try {
      const { code } = req.body

      const responseTokenData = await kakaoService.getTokenKakao(code)
      const { tokenData, accessToken } = await kakaoService.transformKakaoTokenData(responseTokenData)
      const { id: kakaoId } = await kakaoService.getKakaoUserInfo(accessToken)

      const virtualEmail = await authService.generateVirtualEmail('kakao', kakaoId)

      const { oauthAccount, created, isDefaultNick } = await authService.findOrCreateUser({ tokenData, virtualEmail })

      const loginData = cleanLoginData(req, 'kakao')

      const loginHistoryData = { loginData, userId: oauthAccount.User.id }

      await authService.recordLoginHistory(loginHistoryData)

      logger.info('oauthAccount:', oauthAccount)
      logger.debug('created:', created)
      logger.info('isDefaultNick:', isDefaultNick)

      const oauthData = {
         oauthAccount,
         created,
         isDefaultNick,
      }

      return authController.processOAuthLogin(oauthData, req, res)
   } catch (error) {
      next(error) // 에러 처리 미들웨어로 전달
   }
}
