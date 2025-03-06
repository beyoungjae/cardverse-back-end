require('dotenv').config()

const config = {
   development: {
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'cardverse',
      host: process.env.DB_HOST || '127.0.0.1',
      dialect: 'mysql',
      logging: false, // 로그 비활성화
      timezone: '+09:00', // 저장시 9시간 더해서
      dialectOptions: {
         charset: 'utf8mb4',
         dateStrings: true,
         typeCast: true,
      },
   },
   test: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      timezone: '+09:00',
      dialectOptions: {
         charset: 'utf8mb4',
         dateStrings: true,
         typeCast: true,
      },
   },
   production: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      timezone: '+09:00',
      dialectOptions: {
         charset: 'utf8mb4',
         dateStrings: true,
         typeCast: true,
      },
   },
}

module.exports = config
