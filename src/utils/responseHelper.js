exports.transformAuthResponse = ({ success = false, user = null, token = null, provider = 'guest', message = null }) => {
   if (!success) {
      return {
         success,
         message: message ?? '요청 처리에 실패하였습니다.',
         user: null,
         token: null,
         isAuthenticated: false,
      }
   }

   return {
      success,
      message: message ?? '요청 처리에 성공하였습니다.',
      isAuthenticated: true,
      user: {
         id: user.id,
         email: user.email,
         nick: user.nick,
         role: user.role,
         lastLogin: user.lastLogin,
         provider: provider || 'local',
      },

      authData: {
         id: user.id,
         email: user.email,
         nick: user.nick,
         role: user.role,
         provider: provider || 'local',
         accessToken: token?.accessToken || null,
      },
   }
}

exports.notLoginResponse = () => {
   return {
      success: false,
      message,
      user: {},
      token: {},
   }
}

exports.kakaoLogoutData = () => {
   return {
      success: false,
      user: {},
   }
}
