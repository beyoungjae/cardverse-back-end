const winston = require('winston')

// 5차버전
const logger = winston.createLogger({
   level: 'debug',
   format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf((info) => {
         let message = info.message

         // 메시지가 객체인 경우 JSON.stringify로 변환
         if (typeof message === 'object') {
            message = JSON.stringify(message, null, 4) // 가독성을 위해 포맷팅
         }

         // 추가 인자가 있을 경우
         const args = info[Symbol.for('splat')] || []
         if (args.length > 0) {
            const argString = args
               .map(
                  (arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)), // 모든 것을 문자열로 변환
               )
               .join(' ')
            message = `${message} ${argString}`
         }

         return `${info.level}: ${message}`
      }),
   ),
   transports: [new winston.transports.Console()],
})

module.exports = logger

// 4차 버전
// const logger = winston.createLogger({
//    level: 'debug',
//    format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.printf((info) => {
//          const args = info[Symbol.for('splat')] || []
//          let message = info.message

//          // 추가 인자가 있으면 JSON.stringify로 처리해서 붙임
//          if (args.length > 0) {
//             const argString = args
//                .map(
//                   (arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)), // 모든 것을 문자열로 변환
//                )
//                .join(' ')
//             message = `${message} ${argString}`
//          }

//          // 에러 객체라면 `error.stack` 포함해서 출력
//          if (info instanceof Error) {
//             return `${info.level}: ${message}\n${info.stack}`
//          }

//          return `${info.level}: ${message}`
//       }),
//    ),
//    transports: [new winston.transports.Console()],
// })

// module.exports = logger

// ▼ 3차버전
// const logger = winston.createLogger({
//    level: 'debug',
//    format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.printf((info) => {
//          // 메시지가 여러 인자인 경우 처리
//          const args = info[Symbol.for('splat')] || []
//          let message = info.message

//          // 추가 인자가 있으면 JSON.stringify로 처리해서 붙임
//          if (args.length > 0) {
//             const argString = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ')
//             message = `${message} ${argString}`
//          }

//          // 에러 객체라면 `error.stack` 포함해서 출력
//          if (info instanceof Error) {
//             return `${info.level}: ${message}\n${info.stack}`
//          }

//          return `${info.level}: ${message}`
//       }),
//    ),
//    transports: [new winston.transports.Console()],
// })

// module.exports = logger

// ▼ 2차버전
// const logger = winston.createLogger({
//    level: 'debug',
//    format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.printf((info) => {
//          // 메시지가 여러 인자인 경우를 처리
//          const args = info[Symbol.for('splat')] || []
//          let message = info.message

//          // 추가 인자가 있으면 JSON.stringify로 처리해서 붙임
//          if (args.length > 0) {
//             const argString = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ')
//             message = `${message} ${argString}`
//          }

//          return `${info.level}: ${message}`
//       }),
//    ),
//    transports: [new winston.transports.Console()],
// })

// module.exports = logger

// ▼ 1차버전
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
