const { authService } = require('../services/authService')
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
      const user = await authService.login(req, res, next)

      req.session.provider = provider

      const updateUserLoginHistory = await authService.recordLoginHistory(req, provider, user)

      const responseUser = transformAuthResponse({ success: true, user: updateUserLoginHistory, provider, message: '로그인 성공' })

      return res.status(200).json(responseUser)
   } catch (error) {
      console.error('로그인 중 에러 발생:', error)
      res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' })
   }
}

exports.logout = async (req, res, next) => {
   req.session.provider = 'guest'
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
   const provider = req.session.provider
   if (req.isAuthenticated()) {
      res.json({
         isAuthenticated: true,
         user: {
            id: req.user.id,
            email: req.user.email,
            nick: req.user.nick,
            role: req.user.role,
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
      const { success, message } = authService.validNick(nick)

      if (!success) {
         return res.status(400).json({
            success,
            message,
         })
      }

      const userId = req.session.userId

      const updatedUser = await authService.updateUserProfile(userId, { nick })
      console.userId.id
      console.ression.privder

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
