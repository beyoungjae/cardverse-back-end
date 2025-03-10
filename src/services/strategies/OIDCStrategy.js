const jwt = require('jsonwebtoken')
const logger = require('../../config/logger')

class OIDCStrategy {
   async getProviderUserId(token) {
      if (!token.idToken) {
         throw new Error('idToken이 없습니다.')
      }

      const decoded = jwt.decode(token.idToken)
      if (!decoded || !decoded.sub) {
         throw new Error('id_token에 sub 값이 없습니다.')
      }

      return decoded.sub
   }
}

module.exports = OIDCStrategy
