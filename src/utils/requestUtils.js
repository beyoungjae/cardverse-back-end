exports.getClientIp = (req) => {
   const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '0.0.0.0'

   return ipAddress.split(',')[0].trim()
}

exports.cleanLoginData = (req, loginType) => {
   return {
      ipAddress: this.getClientIp(req),
      userAgent: req.headers['user-agent']?.substring(0, 500) || null,
      loginType,
   }
}
