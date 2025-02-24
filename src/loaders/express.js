const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')

function expressLoader(app) {
   // CORS 설정
   app.use(
      cors({
         origin: process.env.FRONTEND_URL || 'http://localhost:3000',
         credentials: true,
      }),
   )

   // 기본 미들웨어
   app.use(express.json())
   app.use(express.urlencoded({ extended: false }))
   app.use(cookieParser(process.env.COOKIE_SECRET))
   app.use(morgan('dev'))

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
         },
         name: 'cardverse.sid',
      }),
   )

   // CORS Preflight
   app.options('*', cors())
}

module.exports = expressLoader