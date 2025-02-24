const fs = require('fs')
const path = require('path')

function uploadLoader() {
   const uploadsDir = path.join(__dirname, '../../uploads')
   if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir)
   }
}

module.exports = uploadLoader
