const logger = require('../config/logger')
const authService = require('../services/authService')
const passportService = require('../services/passportService')

exports.processOAuthLogin = async (oauthData, req, res) => {
   try {

      const { created, oauthAccount } = oauthData
      const userId = oauthAccount.User.id

      const loginHistory = !created ? await authService.getLoginHistory(userId) : null

      const statusCode = oauthData.created ? 201 : 200

      const responseData = await authService.formatOAuthResponse({ oauthData, loginHistory })

      res.status(statusCode).json(responseData)
   } catch (error) {
      throw error
   }
}

exports.localLogin = async (req, res, next) => {
   try {
      const { email, password } = req.body

      const { success, message, user, status } = await passportService.localLogin(email, password, req)

      const loginData = cleanLoginData(req, 'local')
      const loginHistoryData = { loginData, userId: user.id }

      return res.status(status).json({ success, message, user })
   } catch (error) {
      logger.error('Login Controller Error:', error)
      return res.status(500).json({
         success: false,
         message: '서버 내부 오류가 발생하였습니다.',
      })
   }
}
