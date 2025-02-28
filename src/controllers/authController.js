const logger = require('../config/logger')
const { authService } = require('../services/authService')
const passport = require('passport')
const { transformAuthResponse } = require('../utils/responseHelper')

exports.login = async (req, res, next) => {
   try {
      const { email, password } = req.body
      const provider = 'local'
      const user = await authService.login(email, password)
      console.log('user 데이터\n', user)
      await authService.recordLoginHistory(req, provider, user)

      const responseData = transformAuthResponse(user, null, provider, null, '로그인 성공')

      return res.status(200).json(responseData)
   } catch (error) {
      console.error(error)
      throw error
   }
}

exports.signup = async (req, res, next) => {
   try {
      const { email, password, nick, signupType, referralEmail } = req.body

      const exUser = await authService.getUserData(email, nick)
   } catch (error) {
      console.error(error)
      throw error
   }
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
