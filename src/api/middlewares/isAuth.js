const authController = require('../../controllers/authController')
const oauthController = require('../../controllers/oauthController')

exports.checkProvider = (req, res, next) => {
   if (!req.session.provider) {
      req.session.provider = 'guest'
   }
   next()
}

exports.providerHandler = (action) => {
   return async (req, res, next) => {
      try {
         const provider = req.session.provider || 'guest'
         const controller = ['local', 'guest'].includes(provider) ? authController : oauthController

         if (controller[action]) {
            return controller[action](req, res, next)
         } else {
            return res.status(400).json({ message: '해당 핸들러가 존재하지 않습니다.' })
         }
      } catch (error) {
         next(error)
      }
   }
}

exports.isLoggedIn = (req, res, next) => {
   if (req.session.userId) {
      return next()
   }
   return res.status(401).json({
      success: false,
      message: '로그인이 필요합니다.',
   })
}

exports.isNotLoggedIn = (req, res, next) => {
   if (!req.session.userId) {
      return next()
   }
   return res.status(403).json({
      success: false,
      message: '이미 로그인되어 있습니다.',
   })
}

exports.isAdmin = (req, res, next) => {
   if (req.isAuthenticated()) {
      if (req.user && req.user.role === 'admin') {
         next()
      } else {
         res.status(403).json({
            success: false,
            message: '관리자 권한이 필요합니다.',
         })
      }
   } else {
      res.status(403).json({
         success: false,
         message: '로그인이 필요합니다.',
      })
   }
}
