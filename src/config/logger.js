const winston = require('winston')

const logger = winston.createLogger({
   level: 'debug',
   format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf((info) => {
         const args = info[Symbol.for('splat')] || []
         let message = info.message

         // ✅ 메시지가 객체라면 JSON.stringify()로 변환
         if (typeof message === 'object') {
            message = JSON.stringify(message, null, 4)
         }

         // 추가 인자가 있으면 JSON.stringify로 변환하여 붙이기
         if (args.length > 0) {
            const argString = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 4) : arg)).join(' ')
            message = `${message} ${argString}`
         }

         return `${info.level}: ${message}`
      })
   ),
   transports: [new winston.transports.Console()],
})

module.exports = logger
// const logger = winston.createLogger({
//    level: 'debug',
//    format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.printf((info) => {
//          // 객체나 배열일 경우 JSON.stringify 사용
//          const message =
//             typeof info.message === 'object'
//                ? JSON.stringify(info.message, null, 2) // 들여쓰기 적용
//                : info.message

//          return `${info.level}: ${message}`
//       }),
//    ),
//    transports: [new winston.transports.Console()],
// })

// module.exports = logger
