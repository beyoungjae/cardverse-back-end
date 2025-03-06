require('dotenv').config()

function routeLoader(app) {
   // 라우터 등록
   try {
      app.use('/auth', require('../routes/authRoutes'))
      app.use('/oauth', require('../routes/oauthRoutes'))
      app.use('/templates', require('../routes/templateRoutes'))
      app.use('/reviews', require('../routes/reviewRoutes'))
      app.use('/post', require('../routes/postRouters'))
      app.use('/images', require('../routes/imageRoutes'))
      app.use('/user', require('../routes/userRoutes'))
      app.use('/user-templates', require('../routes/userTemplateRoutes'))
      app.use('/purchase', require('../routes/purchaseRoutes'))

      // 404 처리
      app.use((req, res, next) => {
         const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
         error.status = 404
         console.warn(`404 에러 발생: ${req.method} ${req.url}`)
         next(error)
      })

      // 에러 핸들링
      app.use((err, req, res, next) => {
         console.error('에러 발생:', {
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
      console.error('라우트 로더 초기화 중 에러:', error)
      throw error
   }
}

module.exports = routeLoader
