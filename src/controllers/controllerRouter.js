const authController = require('./authController')
const oauthController = require('./oauthController')

const controllerRouter = (category, action) => (req, res, next) => {
   const provider = req.session.provider 
   let controller

   // ✅ 특정 기능에 따라 적절한 컨트롤러 선택
   if (category === 'auth') {
      controller = provider === 'local'? authController : oauthController
   }  else {
      return res.status(400).json({ success: false, message: '올바르지 않은 요청입니다.' })
   }

   // ✅ 선택된 컨트롤러의 특정 액션 실행
   if (controller[action]) {
      return controller[action](req, res, next)
   } else {
      return res.status(400).json({ success: false, message: '잘못된 액션입니다.' })
   }
}

module.exports = controllerRouter
