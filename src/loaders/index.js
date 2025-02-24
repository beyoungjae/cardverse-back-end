const expressLoader = require('./express')
const databaseLoader = require('./database')
const routeLoader = require('./route')
const uploadLoader = require('./uploads')
// const jobLoader = require('./jobs')

async function init(app) {
   try {
      // Express 미들웨어 초기화
      await expressLoader(app)
      console.log('✅ Express 미들웨어 초기화 완료')

      // 데이터베이스 초기화
      await databaseLoader()
      console.log('✅ 데이터베이스 초기화 완료')

      // 업로드 디렉토리 초기화
      await uploadLoader()
      console.log('✅ 업로드 디렉토리 초기화 완료')

      //    await jobLoader()
      //    console.log('✅ Job 초기화 완료')

      // 라우터 초기화
      routeLoader(app)
      console.log('✅ 라우터 초기화 완료')
   } catch (error) {
      console.error('Loader error:', error) // 에러 로깅
   }
}

module.exports = init
