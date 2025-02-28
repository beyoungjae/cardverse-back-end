exports.isLoggedInOAuth = (req, res, next) => {
   if (req.session.user) {
      // 세션에 사용자 정보가 존재하는지 확인
      req.user = req.session.user
      next() // 로그인된 경우 다음 미들웨어로 이동
   } else {
      res.status(403).json({
         success: false,
         message: '로그인이 필요합니다.',
      })
   }
}

exports.isNotLoggedInOAuth = (req, res, next) => {
   if (!req.session.user) {
      // 세션에 사용자 정보가 없는지 확인
      next() // 비로그인 상태인 경우 다음 미들웨어로 이동
   } else {
      res.status(400).json({
         success: false,
         message: '이미 로그인이 된 상태입니다.',
      })
   }
}
