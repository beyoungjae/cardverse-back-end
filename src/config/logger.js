const winston = require('winston')

const logger = winston.createLogger({
   level: 'debug',
   format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf((info) => {
         // 메시지가 여러 인자인 경우를 처리
         const args = info[Symbol.for('splat')] || []
         let message = info.message

         // 추가 인자가 있으면 JSON.stringify로 처리해서 붙임
         if (args.length > 0) {
            const argString = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ')
            message = `${message} ${argString}`
         }

         return `${info.level}: ${message}`
      }),
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
