const express = require('express')
require('dotenv').config()

const app = express()

async function startServer() {
   try {
      await require('./src/loaders')(app)

      const PORT = process.env.PORT || 8000
      app.listen(PORT, () => {
         console.log(`🚀 서버가 ${PORT}번 포트에서 실행 중입니다.`)
      })
   } catch (error) {
      console.error('❌ 서버 시작 실패:', error)
      process.exit(1)
   }
}

// 개발 환경에서만 서버 시작
if (process.env.NODE_ENV === 'development') {
   startServer()
}

module.exports = app
