const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const path = require('path')

// 로그 폴더 경로
const logDir = 'log'

// 로그 포맷 설정
const logFormat = winston.format.combine(
   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
   winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`
   }),
)

// 로그 파일 설정
const transport = new DailyRotateFile({
   filename: path.join(logDir, '%DATE%.log'),
   datePattern: 'YYYY-MM-DD',
   zippedArchive: false,
   maxSize: '20m',
   maxFiles: '7d',
   dirname: logDir,
})

// Winston 로거 생성
const logger = winston.createLogger({
   level: 'info',
   format: logFormat,
   transports: [transport, new winston.transports.Console()],
})

// 로거 내보내기
module.exports = logger
