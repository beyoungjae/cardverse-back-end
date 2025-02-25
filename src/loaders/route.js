function routeLoader(app) {

   // 라우터 등록
   app.use('/templates', require('../routes/templateRoutes'))
   app.use('/reviews', require('../routes/reviewRoutes'))
   app.use('/images', require('../routes/imageRoutes'))
   app.use('/auth', require('../api/routes/authRoutes'))
   app.use('/oauth', require('../api/routes/oauthRoutes'))

   // 404 처리
   app.use((req, res, next) => {
      const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
      error.status = 404
      next(error)
   })

   // 에러 핸들링
   app.use((err, req, res, next) => {
      console.error(err.stack)
      res.status(err.status || 500).json({
         message: err.message || '서버 오류가 발생했습니다.',
         error: process.env.NODE_ENV === 'development' ? err : {},
      })
   })
}

module.exports = routeLoader
