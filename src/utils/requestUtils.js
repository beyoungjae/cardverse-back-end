exports.getClientIp = (req) => {
   let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '0.0.0.0'

   // IPv6 → IPv4 변환
   if (ipAddress === '::1') {
      ipAddress = '127.0.0.1'
   } else if (ipAddress.includes('::ffff:')) {
   }

   return ipAddress.split(',')[0].trim()
}

exports.cleanLoginData = (req, loginType) => {
   return {
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent']?.substring(0, 500) || null,
      loginType,
   }
}
