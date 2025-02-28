// responseHelper.js

/**
 * 응답 토큰 데이터를 생성하는 헬퍼 함수
 * @param {Object} user - 사용자 정보 객체
 * @param {Object} exUser - OauthAccount 정보 객체
 * @param {string} provider - OAuth 제공자
 * @param {string} providerUserId - 제공자에서의 사용자 ID
 * @returns {Object} 생성된 응답 데이터
 */
exports.transformAuthResponse = (user, exUser = {}, provider, providerUserId = null, message = '요청에 대한 처리가 성공했습니다.') => {
   return {
      success: true,
      message,
      user: {
         id: user.id,
         email: user.email,
         nick: user.nick,
         role: user.role,
         lastLogin: user.lastLogin,
         status: user.status,
         provider: provider || 'local',
         providerUserId: providerUserId || null,
      },
      token: {
         accessToken: exUser?.accessToken || null,
         tokenExpiresAt: exUser?.tokenExpiresAt || null,
      },
   }
}

exports.kakaoLogoutData = () => {
   return {
      success: false,
      user: {},
   }
}
