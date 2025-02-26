const User = require('../models/userModels/user')
const OauthAccount = require('../models/userModels/oauthAccount')

exports.findOrCreateKakaoUser = async (profile, accessToken, refreshToken) => {
   try {
      let oauthAccount = await OauthAccount.findOne({
         where: { provider: 'kakao', providerUserId: profile.id.toString() },
         include: [{ model: User }],
      })

      if (oauthAccount) {
         // ✅ 2. 이미 등록된 계정이면 기존 유저 정보 반환
         return oauthAccount.User
      }

      const newUser = await User.create({
         email: profile._json?.kakao_account?.email,
         nick: profile.username || profile._json?.kakao_account?.profile?.nickname,
         role: 'user', // 기본 역할 설정
      })

      // ✅ 4. OauthAccount 테이블에 OAuth 정보 저장
      await OauthAccount.create({
         userId: newUser.id,
         provider: 'kakao',
         providerUserId: profile.id.toString(),
         accessToken,
         refreshToken,
         tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // ✅ 토큰 만료 시간 (예: 1시간 후)
      })
   } catch (error) {}
}
