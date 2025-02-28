const OauthAccount = require('../../models/userModels/oauthAccount')

// 미들웨어 팩토리 함수 - provider를 인자로 받아 미들웨어를 반환합니다
const createRefreshTokenMiddleware = (provider) => {
   return async (req, res, next) => {
      try {
         // 쿠키에서 리프레시 토큰 추출
         const refreshToken = req.cookies.refreshToken
         const user = req.session.user

         if (!refreshToken) {
            return res.status(401).json({
               isAuthenticated: false,
               message: '인증 정보가 없습니다.',
            })
         }

         // 데이터베이스에서 해당 provider와 refreshToken으로 사용자 찾기
         const matchUser = await OauthAccount.findOne({
            where: { provider, refreshToken },
         })

         if (!matchUser) {
            return res.status(401).json({
               isAuthenticated: false,
               message: '유효하지 않은 인증 정보입니다.',
            })
         }

         if (!user) {
            return res.status(401).json({
               isAuthenticated: false,
               message: '유효하지 않은 사용자 정보입니다.',
            })
         }

         req.refreshToken = refreshToken
         req.user = user
         next()
      } catch (error) {
         console.error(`${provider} 리프레시 토큰 검증 오류:`, error)
         return res.status(500).json({
            isAuthenticated: false,
            message: '서버 오류가 발생했습니다.',
         })
      }
   }
}

// 사용 예시
const isKakaoRefreshToken = createRefreshTokenMiddleware('kakao')
const isGoogleRefreshToken = createRefreshTokenMiddleware('google')
const isNaverRefreshToken = createRefreshTokenMiddleware('naver')

module.exports = {
   isKakaoRefreshToken,
   isGoogleRefreshToken,
   isNaverRefreshToken,
}
