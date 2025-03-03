exports.checkProvider = (req, res, next) => {
   if (!req.session.provider) {
      return res.status(401).json({ success: false, message: '인증 정보가 유효하지 않습니다.' })
   }
   next()
}

exports.isLoggedIn = (req, res, next) => {
   if (req.isAuthenticated()) {
      next()
   } else {
      res.status(401).json({
         success: false,
         message: '로그인이 필요합니다.',
      })
   }
}

exports.isNotLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      next()
   } else {
      // 클라이언트에서 명시적으로 세션 정리를 요청한 경우
      const forceLogin = req.headers['x-force-login'] === 'true';
      
      if (forceLogin) {
         // 기존 세션 정리
         req.logout((error) => {
            if (error) {
               return res.status(500).json({
                  success: false,
                  message: '세션 정리 중 오류가 발생했습니다.',
                  error: error.message,
               });
            }
            // 세션 정리 후 다음 미들웨어로 진행
            next();
         });
      } else {
         res.status(403).json({
            success: false,
            message: '이미 로그인되어 있습니다.',
         })
      }
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
