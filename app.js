const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const fs = require('fs')
require('dotenv').config()

const app = express()

// ✅ CORS 설정
app.use(
   cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
   })
)

// ✅ 미들웨어 설정
app.use(express.json()) // JSON 파싱
app.use(express.urlencoded({ extended: false })) // URL 인코딩된 데이터 파싱
app.use(cookieParser(process.env.COOKIE_SECRET)) // 쿠키 파싱
app.use(morgan('dev')) // 로깅
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))) // 이미지 저장 경로

// ✅ 세션 설정 (보안 강화)
app.use(
   session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET,
      cookie: {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production', // 배포 환경일 경우 secure true
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7일 유지
      },
      name: 'cardverse.sid', // 세션 쿠키명 변경
   })
)

// ✅ 라우터 설정
app.use('/templates', require('./src/routes/templateRoutes'))
app.use('/reviews', require('./src/routes/reviewRoutes'))

// 📷 이미지 라우터 등록
app.use('/images', require('./src/routes/imageRoutes'))

// 📷 uploads 폴더 생성
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
   fs.mkdirSync(uploadsDir)
}

// ✅ 잘못된 라우터 요청 처리 (404)
app.use((req, res, next) => {
   const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
   error.status = 404
   next(error)
})

// ✅ 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
   console.error(err.stack)
   res.status(err.status || 500).json({
      message: err.message || '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? err : {}, // 개발 환경일 때만 상세 오류 반환
   })
})

// ✅ CORS Preflight 요청 허용
app.options('*', cors())

const PORT = process.env.PORT || 8000

// ✅ 서버 실행
async function startServer() {
   try {
      const db = require('./src/models')
      await db.sequelize.authenticate()
      console.log('✅ 데이터베이스 연결 성공')

      await db.sequelize.sync({ alter: true })
      console.log('✅ 데이터베이스 동기화 완료')

      app.listen(PORT, () => {
         console.log(`🚀 서버가 ${PORT}번 포트에서 실행 중입니다.`)
      })
   } catch (error) {
      console.error('❌ 서버 시작 실패:', error)
   }
}

startServer()

module.exports = app
