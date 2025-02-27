// responseHelper.js

/**
 * 응답 토큰 데이터를 생성하는 헬퍼 함수
 * @param {Object} user - 사용자 정보 객체
 * @param {Object} exUser - OauthAccount 정보 객체
 * @param {string} provider - OAuth 제공자
 * @param {string} providerUserId - 제공자에서의 사용자 ID
 * @returns {Object} 생성된 응답 데이터
 */
exports.responseOAuthData = (user, exUser, provider, providerUserId) => {
   return {
      status: 'success',
      user: {
         id: user.id,
         email: user.email === `${provider}${providerUserId}@temp.com` ? `${provider} 로그인입니다.` : user.email,
         nick: user.nick,
         role: user.role,
         lastLogin: user.lastLogin,
         status: user.status,
         provider,
         providerUserId,
      },
      token: {
         accessToken: exUser.accessToken,
         refreshToken: exUser.refreshToken,
         tokenExpiresAt: exUser.tokenExpiresAt,
      },
      createdAt: exUser.createdAt,
      updatedAt: exUser.updatedAt,
   }
}
