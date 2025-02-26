const fs = require('fs').promises
const path = require('path')

async function uploadLoader() {
   const uploadsDir = path.join(__dirname, '../../uploads')
   try {
      await fs.access(uploadsDir)
   } catch (error) {
      await fs.mkdir(uploadsDir)
   }
}

module.exports = uploadLoader
