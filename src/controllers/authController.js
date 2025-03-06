const { authService } = require('../services/authService')
const { setUser, removeUser, getUser } = require('../utils/cache')
const { transformAuthResponse } = require('../utils/responseHelper')

exports.signup = async (req, res, next) => {
   try {
      const getUser = req.body

      await authService.exUser(getUser.email, getUser.nick)

      const newUser = await authService.createUser(getUser)

      return res.status(201).json(newUser)
   } catch (error) {
      console.error(error)

      // ✅ 추천인 이메일 오류 또는 중복된 경우 409 Conflict 응답
      if (error.message === '이미 사용 중인 이메일 또는 닉네임입니다.' || error.message.includes('추천인')) {
         return res.status(409).json({
            success: false,
            message: error.message,
         })
      }

      // ✅ 그 외 서버 오류 처리
      return res.status(500).json({
         success: false,
         message: '서버 오류가 발생했습니다.',
      })
   }
}
exports.login = async (req, res, next) => {
   try {
      const provider = 'local'
      const { email, password } = req.body
      console.log('email:', email)
      console.log('password:', password)

      const loginUser = await authService.existingUser(email, password, provider)
      console.log('loginUser:', loginUser.user.id)

      await authService.recordLoginHistory(req, provider, loginUser)

      req.session.userId = loginUser.user.id
      req.session.provider = provider
      setUser(loginUser.user.id, provider, null)

      return res.status(200).json(loginUser)
   } catch (error) {
      console.error('로그인 중 에러 발생:', error)
      res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' })
   }
}

exports.login2 = async (req, res, next) => {
   try {
      const provider = 'local'
      const user = await authService.login(req, res, next)

      req.session.provider = provider
      req.session.userId = user.id

      const updateUserLoginHistory = await authService.recordLoginHistory(req, provider, user)

      const responseUser = transformAuthResponse({ success: true, user: updateUserLoginHistory, provider, message: '로그인 성공' })

      return res.status(200).json(responseUser)
   } catch (error) {
      console.error('로그인 중 에러 발생:', error)
      res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' })
   }
}

exports.logout = async (req, res, next) => {
   const userId = req.session.userId
   removeUser(userId)
   console.log('캐시유저 삭제 조회', getUser(userId))

   req.session.destroy((err) => {
      if (err) return next(err)
      res.clearCookie('cardverse.sid') // ✅ 클라이언트 쿠키 삭제
      res.status(200).json({
         success: true,
         isAuthenticated: false,
         message: '로그아웃에 성공했습니다.',
         user: null,
         authData: null,
      })
   })
}

exports.logout2 = async (req, res, next) => {
   req.session.provider = 'guest'
   // userId 세션 삭제
   req.session.userId = null

   req.logout((error) => {
      if (error) {
         console.error(error)

         return res.status(500).json({
            success: false,
            message: '로그아웃 중 오류가 발생했습니다.',
            error: error.message,
         })
      }

      res.json({
         success: true,
         message: '로그아웃에 성공했습니다.',
      })
   })
}

exports.status = async (req, res, next) => {
   console.log('userId:', req.session.userId)
   console.log('provider:')
   if (!req.session.provider || !req.session.userId) {
      return res.status(200).json({
         isAuthenticated: false,
      })
   }

   const userId = req.session.userId
   const provider = req.session.provider

   const userData = await authService.validUser(userId, provider, null)

   return res.status(200).json(userData)
}

exports.status2 = async (req, res, next) => {
   const provider = req.session.provider || 'guest'

   // Passport 인증 또는 세션 userId가 있으면 인증된 것으로 간주
   if (req.isAuthenticated() || req.session.userId) {
      // req.user가 있으면 그것을 사용, 없으면 세션 userId로 사용자 조회
      let userData = req.user

      // 세션 데이터 일관성 유지
      if (!req.session.userId && req.user) {
         req.session.userId = req.user.id
      }

      res.json({
         isAuthenticated: true,
         user: {
            id: userData ? userData.id : req.session.userId,
            email: userData ? userData.email : null,
            nick: userData ? userData.nick : null,
            role: userData ? userData.role : null,
            provider,
         },
      })
   } else {
      res.json({
         isAuthenticated: false,
      })
   }
}

exports.updateProfile = async (req, res, next) => {
   try {
      const { nick } = req.body

      // 닉네임 유효성 검사
      if (nick) {
         const { success, message } = await authService.validNick(nick)

         if (!success) {
            return res.status(400).json({
               success,
               message,
            })
         }
      }

      // userId 확인 - req.user.id를 우선 사용하고, 없으면 req.session.userId 사용
      const userId = req.user ? req.user.id : req.session.userId

      // userId가 없는 경우 에러 처리
      if (!userId) {
         return res.status(401).json({
            success: false,
            message: '로그인이 필요합니다.',
         })
      }

      const updatedUser = await authService.updateUserProfile(userId, { nick })

      // 디버깅을 위한 올바른 로그 (필요한 경우)

      return res.status(200).json({
         success: true,
         message: '프로필이 성공적으로 업데이트되었습니다.',
         user: updatedUser,
      })
   } catch (error) {
      console.error('프로필 업데이트 중 오류가 발생했습니다.', error)

      // 닉네임 중복 오류 처리
      if (error.message === '이미 사용 중인 닉네임입니다.') {
         return res.status(409).json({
            success: false,
            message: error.message,
         })
      }

      return res.status(500).json({
         success: false,
         message: '서버 오류가 발생했습니다.',
         error: error.message,
      })
   }
}
