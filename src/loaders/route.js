require('dotenv').config()
const logger = require('../config/logger')

function routeLoader(app) {
   // 라우터 등록
   try {
      app.use('/templates', require('../routes/templateRoutes'))
      app.use('/reviews', require('../routes/reviewRoutes'))
      app.use('/images', require('../routes/imageRoutes'))
      app.use('/auth', require('../api/routes/authRoutes'))
      app.use('/oauth', require('../api/routes/oauthRoutes'))
      app.use('/user-templates', require('../routes/userTemplateRoutes'))

      // 404 처리
      app.use((req, res, next) => {
         const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
         error.status = 404
         logger.warn(`404 에러 발생: ${req.method} ${req.url}`)
         next(error)
      })

      // 에러 핸들링
      app.use((err, req, res, next) => {
         logger.error('에러 발생:', {
            message: err.message,
            stack: err.stack,
            path: `${req.method} ${req.url}`,
         })

         res.status(err.status || 500).json({
            message: err.message || '서버 오류가 발생했습니다.',
            error: process.env.NODE_ENV === 'development' ? err : {},
         })
      })
   } catch (error) {
      logger.error('라우트 로더 초기화 중 에러:', error)
      throw error
   }
}

module.exports = routeLoader

// async function routeLoader(app) {
//    return new Promise((resolve, reject) => {
//       try {
//          console.log('📡 라우터 로더 시작')

//          // 1. 라우터 등록
//          app.use('/templates', require('../routes/templateRoutes'))
//          app.use('/reviews', require('../routes/reviewRoutes'))
//          app.use('/images', require('../routes/imageRoutes'))
//          app.use('/auth', require('../api/routes/authRoutes'))
//          app.use('/oauth', require('../api/routes/oauthRoutes'))

//          // 2. 404 에러 처리 (존재하지 않는 라우트)
//          app.use((req, res, next) => {
//             const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
//             error.status = 404
//             next(error)
//          })

//          // 3. 전역 에러 핸들링 미들웨어
//          app.use((err, req, res, next) => {
//             // 에러 로깅
//             console.error('❌ 에러 발생:', {
//                message: err.message,
//                stack: err.stack,
//                status: err.status || 500,
//                path: req.path,
//                method: req.method,
//             })

//             // 클라이언트에 반환할 에러 응답
//             res.status(err.status || 500).json({
//                success: false,
//                message: err.message || '서버 오류가 발생했습니다.',
//                error:
//                   process.env.NODE_ENV === 'development'
//                      ? {
//                           stack: err.stack,
//                           ...err,
//                        }
//                      : {},
//             })
//          })

//          console.log('✅ 라우터 및 에러 핸들링 설정 완료')
//          resolve()
//       } catch (error) {
//          console.error('❌ 라우터 로더 에러:', error)
//          reject(error)
//       }
//    })
// }

// module.exports = routeLoader
