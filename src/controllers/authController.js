const logger = require('../config/logger')
const { authService } = require('../services/authService')

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

exports.getMyProfile = async ()