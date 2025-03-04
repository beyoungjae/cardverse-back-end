const logger = require('../config/logger')
const expressLoader = require('./express')
const databaseLoader = require('./database')
const routeLoader = require('./route')
const uploadLoader = require('./uploads')
const passportLoader = require('./passport')

async function init(app) {
   try {
      await expressLoader(app)
      logger.info('✅ Express 미들웨어 초기화 완료')

      await databaseLoader()
      logger.info('✅ 데이터베이스 초기화 완료')

      await passportLoader(app)
      logger.info('✅ Passport 초기화 완료')

      await uploadLoader()
      logger.info('✅ 업로드 디렉토리 초기화 완료')

      routeLoader(app)
      logger.info('✅ 라우터 초기화 완료')
   } catch (error) {
      console.error('Loader error:', error) // 에러 로깅
   }
}

module.exports = init
