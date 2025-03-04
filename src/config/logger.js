const winston = require('winston')

const logger = winston.createLogger({
   level: 'debug',
   format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf((info) => {
         let message = info.message

         if (typeof message === 'object') {
            message = JSON.stringify(message, null, 4)
         }

         const args = info[Symbol.for('splat')] || []
         if (args.length > 0) {
            const argString = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ')
            message = `${message} ${argString}`
         }

         return `${info.level}: ${message}`
      }),
   ),
   transports: [new winston.transports.Console()],
})

module.exports = logger
