const { User, OauthAccount } = require('../models')

const kakaoAuthService = {
   async findOrCreateKakaoUser(kakaoProfile) {
      try {
         // 1. 먼저 카카오 계정으로 기존 OAuth 계정 찾기
         const existingOAuth = await OauthAccount.findOne({
            where: {
               provider: 'kakao',
               providerUserId: kakaoProfile.id.toString(),
            },
            include: [{ model: User }],
         })

         if (existingOAuth) {
            // 기존 연동된 계정이 있으면 토큰만 업데이트
            await existingOAuth.update({
               accessToken: kakaoProfile.access_token,
               tokenExpiresAt: new Date(Date.now() + kakaoProfile.expires_in * 1000),
            })
            return existingOAuth.User
         }

         // 2. 카카오 이메일로 기존 유저 찾기
         const kakaoEmail = kakaoProfile.kakao_account?.email
         let user = null

         if (kakaoEmail) {
            user = await User.findOne({
               where: { email: kakaoEmail },
            })
         }

         if (!user) {
            // 3. 새 유저 생성
            user = await User.create({
               email: kakaoEmail || `kakao_${kakaoProfile.id}@example.com`,
               nick: kakaoProfile.kakao_account?.profile?.nickname || `User${Date.now()}`,
               role: 'user',
               status: 'active',
               lastLogin: new Date(),
            })
         }

         // 4. OAuth 계정 정보 생성 및 연결
         await OauthAccount.create({
            user_id: user.id,
            provider: 'kakao',
            providerUserId: kakaoProfile.id.toString(),
            accessToken: kakaoProfile.access_token,
            refreshToken: kakaoProfile.refresh_token,
            tokenExpiresAt: new Date(Date.now() + kakaoProfile.expires_in * 1000),
         })

         return user
      } catch (error) {
         console.error('Kakao auth service error:', error)
         throw error
      }
   },

   // 로그인 시 lastLogin 업데이트
   async updateLastLogin(userId) {
      await User.update({ lastLogin: new Date() }, { where: { id: userId } })
   },
}

module.exports = kakaoAuthService
