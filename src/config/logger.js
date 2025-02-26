const winston = require('winston')

const logger = winston.createLogger({
   level: 'debug',
   format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf((info) => `${info.level}: ${info.message}`),
   ),
   transports: [new winston.transports.Console()],
})

module.exports = logger
