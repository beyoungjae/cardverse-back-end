const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path')

function expressLoader(app) {
   // CORS 설정
   app.use(
      cors({
         origin: process.env.FRONTEND_URL || 'http://localhost:3000',
         credentials: true,
      })
   )

   // 기본 미들웨어
   app.use(express.json())
   app.use(express.urlencoded({ extended: false }))
   app.use(cookieParser(process.env.COOKIE_SECRET))
   app.use(morgan('dev'))

   // 정적 파일 서빙 설정
   app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

   // 세션 설정
   app.use(
      session({
         resave: false,
         saveUninitialized: false,
         secret: process.env.COOKIE_SECRET,
         cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: 'strict', // 쿠키 보안 설정 CSRF 공격 방지 : CSRF는 웹 사이트 취약점 중 하나로, 사용자가 자신의 의지와 무관하게 공격자가 의도한 행위를 수행하게 하는 것을 의미
         },
         name: 'cardverse.sid',
         rolling: true, // 세션 만료 시간 갱신
      })
   )

   // CORS Preflight
   app.options('*', cors())
}

module.exports = expressLoader
