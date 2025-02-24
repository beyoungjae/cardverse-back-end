const db = require('../models')

async function databaseLoader() {
   try {
      await db.sequelize.authenticate()
      await db.sequelize.sync({ alter: true })
   } catch (error) {
      console.error('❌ 데이터베이스 초기화 실패:', error)
      throw error
   }
}

module.exports = databaseLoader
