const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const path = require('path')
const logger = require('../config/logger')
const AppError = require('../utils/AppError')
require('dotenv').config()

function expressLoader(app) {
   // CORS 설정
   app.use(
      cors({
         origin: process.env.FRONTEND_URL || 'http://localhost:3000',
         credentials: true,
      })
   )

   // 기본 미들웨어
   app.use(morgan('dev'))
   app.use(express.json())
   app.use(express.urlencoded({ extended: false }))
   app.use(cookieParser(process.env.COOKIE_SECRET))

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
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 프로덕션 환경에서는 쿠키를 보호하기 위해 'none'으로 설정, 개발 환경에서는 'lax'로 설정
         },
         name: 'cardverse.sid', // 세션 이름
      })
   )

   // CORS Preflight
   app.options('*', cors())

   // 공통 미들웨어로 logger와 AppError 추가
   app.use((req, res, next) => {
      req.logger = logger
      req.AppError = AppError
      next()
   })
}

module.exports = expressLoader
