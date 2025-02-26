require('dotenv').config()

const config = {
   development: {
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '12345678',
      database: process.env.DB_NAME || 'cardverse',
      host: process.env.DB_HOST || '127.0.0.1',
      dialect: 'mysql',
      logging: false, // 로그 비활성화
      timezone: '+09:00', // 한국 타임스탬프로 변환
   },
   test: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      timezone: '+09:00',
   },
   production: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      timezone: '+09:00',
   },
}

module.exports = config
