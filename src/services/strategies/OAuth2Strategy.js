const axios = require('axios')
const AppError = require('../../utils/AppError')

class OAuth2Strategy {
   constructor(userInfoUrl) {
      this.userInfoUrl = userInfoUrl
   }

   async getProviderUserId(token) {
      if (!token.accessToken) {
         throw new Error('accessToken이 없습니다.')
      }

      // OAuth2.0은 API를 호출하여 유저 정보를 가져옴
      const response = await axios.get(this.userInfoUrl, {
         headers: { Authorization: `Bearer ${token.accessToken}` },
      })

      if (!response.data || !response.data.id) {
         throw new Error('유저 ID를 찾을 수 없습니다.')
      }

      return response.data.id
   }
}

module.exports = OAuth2Strategy
