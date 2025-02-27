exports.isLoggedIn = (req, res, next) => {
   if (req.isAuthenticated()) {
      next()
   } else {
      req.status(403).json({
         success: false,
         message: '로그인이 필요합니다.',
      })
   }
}

exports.isNotLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      next()
   } else {
      res.status(400).json({
         success: false,
         message: '이미 로그인이 된 상태입니다.',
      })
   }
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
