const { authService } = require('../services/authService')
const { oauthService, getOAuthService } = require('../services/oauthService')
const { transformAuthResponse } = require('../utils/responseHelper')
const { setUser, getUser, removeUser } = require('../utils/cache')

exports.oauthLogin = async (req, res, next) => {
   try {
      const { code, provider } = req.body

      const oauthClient = await getOAuthService(provider)

      const token = await oauthClient.getAccessToken(code)
      const providerUserId = await oauthClient.getProviderUserId(token)

      const exUser = await oauthService.getOAuthUser(provider, providerUserId)

      let userData

      if (exUser === null) {
         const virtualEmail = oauthService.generateVirtualEmail(provider, providerUserId)

         userData = await oauthService.createUser(provider, providerUserId, virtualEmail, token)
      } else {
         userData = await oauthService.updateUser(exUser, provider, token, providerUserId)
      }

      await authService.recordLoginHistory(req, provider, userData)

      res.cookie('refreshToken', token.refreshToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'Strict',
         maxAge: 1000 * 60 * 60 * 24 * 7,
      })

      req.session.userId = userData.user.id
      req.session.provider = provider
      setUser(userData.user.id, provider, userData.authData.accessToken)

      return res.status(200).json(userData)
   } catch (error) {
      console.error('OAuth 로그인 에러:', error)
      res.status(500).json({
         message: 'oauth 로그인 중 오류가 발생했습니다.',
      })
   }
}

exports.status = async (req, res, next) => {
   try {
      const userId = req.session.userId
      const backUser = getUser(userId)
      const frontUser = req.body

      if (userId !== frontUser.id) {
         removeUser(userId)
         req.session.provider = 'guest'
         delete req.session.userId

         res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
         })

         return res.status(404).json({
            success: false,
            message: '유효하지 않은 사용자입니다.',
         })
      }

      const checkToken = oauthService.checkToken(frontUser, backUser)
      if (checkToken.success === true) {
         return res.status(200).json(checkToken)
      }

      const provider = req.session.provider

      const refreshToken = req.cookies.refreshToken

      const validUser = await authService.validUser(userId, provider, refreshToken)

      if (validUser === false) {
         const responseData = transformAuthResponse({ message: '재 로그인이 필요합니다.' })
         console.error('인증 정보가 유효하지 않습니다.')
         req.session.provider = 'guest'

         res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
         })
         return res.status(404).json(responseData)
      }

      const fetchToken = await oauthService.fetchToken(refreshToken)

      const responseData = transformAuthResponse({ success: true, user, token: fetchToken, provider, message: '로그인 유저 체크 완료' })

      return res.status(200).json(responseData)
   } catch (error) {
      console.error('OAuth 로그인 상태 확인 에러:', error)
      res.status(500).json({ message: 'oauth 로그인 상태 확인 중 오류가 발생했습니다..' })
   }
}

exports.logout = async (req, res, next) => {
   try {
      const userId = req.session.userId
      const provider = req.session.provider

      // 사용자 정보가 있는 경우에만 토큰 정리
      if (userId && provider) {
         await oauthService.clearToken(userId, provider)
      }

      // 쿠키 제거
      res.clearCookie('refreshToken', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'Strict',
      })

      // 세션 데이터 초기화
      req.session.provider = 'guest'
      req.session.userId = null

      // 세션 완전히 파기
      req.session.destroy((err) => {
         if (err) {
            console.error('세션 파기 중 오류 발생:', err)
            return res.status(500).json({
               success: false,
               message: '로그아웃 중 오류가 발생했습니다.',
            })
         }

         return res.status(200).json({
            success: true,
            message: '성공적으로 로그아웃 되었습니다.',
         })
      })
   } catch (error) {
      console.error('OAuth 로그아웃 에러:', error)
      res.status(500).json({ message: 'oauth 로그아웃 중 오류가 발생했습니다.' })
   }
}
