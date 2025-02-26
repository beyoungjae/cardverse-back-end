const kakaoService = require('../services/kakaoService')
const authService = require('../services/authService')
const logger = require('../config/logger')
const { cleanLoginData } = require('../utils/requestUtils')
const authController = require('./authController')

exports.kakaoCallback = async (req, res) => {
   try {
      const { code } = req.body

      // 1. kakaoService 로직
      const responseToken = await kakaoService.getTokenKakao(code)

      const transformToken = await kakaoService.transformKakaoTokenData(responseToken)

      const accessToken = transformToken.accessToken

      const { id: providerUserId } = await kakaoService.getKakaoUserInfo(accessToken)

      logger.debug(accessToken)

      // 2. authService 로직
      // 2-1. 가상 메일 생성
      // const virtualEmail = await authService.generateVirtualEmail('kakao', providerUserId)

      const { virtualEmail, exists, user } = await authService.generateVirtualEmail('kakao', providerUserId)

      // logger.warn('virtualEmail:', virtualEmail)
      // logger.warn('exists:', exists)
      // logger.warn('user:', user)

      // const userData = {}

      // if (exists) {
      //    await authService.updateUser(user)
      // }

      // await authService.createUser(virtualEmail, provider, providerUserId, tokenData)

      // // 2-2. 소셜 로그인 찾기 및 생성
      // const { oauthAccount, created } = await authService.findOrCreateUser(tokenData, virtualEmail, '카카오', providerUserId)

      // const userId = oauthAccount.User.id

      // await authService.recordLoginHistory(userId, 'kakao', req)

      // logger.info('oauthAccount:', oauthAccount)
      // logger.debug('created:', created)

      // const oauthData = {
      //    oauthAccount,
      //    created,
      // }

      // return authController.processOAuthLogin(oauthData, req, res)
   } catch (error) {
      // next(error) // 에러 처리 미들웨어로 전달
   }
}
