const passport = require('passport')
const KakaoStrategy = require('passport-kakao').Strategy
const User = require('../models/userModels/user')
const OauthAccount = require('../models/userModels/oauthAccount')

module.exports = () => {
   passport.use(
      new KakaoStrategy(
         {
            clientID: process.env.KAKAO_CLIENT_ID,
            callbackURL: '/auth/kakao/callback',
         },
         async (accessToken, refreshToken, profile, done) => {
            try {
               console.log('카카오 프로필:', profile)

               const exOAuthAccount = await OauthAccount.findOne({
                  where: {
                     provider: 'kakao',
                     providerUserId: profile.id.toString(),
                  },
                  include: [{ model: User }],
               })

               if (exOAuthAccount) {
                  return done(null, exOAuthAccount.User)
               }

               const newUser = await User.create({
                  email: profile._json?.kakao_account?.email,
                  nick: profile.username || profile._json?.kakao_account?.profile?.nickname,
                  role: 'user', // 기본 역할 설정
               })

               await OauthAccount.create({
                  userId: newUser.id,
                  provider: 'kakao',
                  providerUserId: profile.id.toString(),
                  accessToken,
                  refreshToken,
               })

               // 생성된 유저 정보 반환
               done(null, newUser)
               // // 기존 카카오 계정이 있는지 확인
               // const exUser = await User.findOne({
               //    where: { snsId: profile.id, provider: 'kakao' },
               // })

               // if (exUser) {
               //    // 기존 유저가 있다면 그대로 반환
               //    done(null, exUser)
               // } else {
               //    // 없다면 새로 생성
               //    const newUser = await User.create({
               //       email: profile._json?.kakao_account?.email,
               //       nickname: profile.displayName,
               //       snsId: profile.id,
               //       provider: 'kakao',
               //    })
               //    done(null, newUser)
               // }
            } catch (error) {
               console.error(error)
               done(error)
            }
         },
      ),
   )
}
