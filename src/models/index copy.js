const Sequelize = require('sequelize')
const config = require('../config')[process.env.NODE_ENV || 'development']
const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

// 1단계: 모델 초기화
const modelDirs = ['userModels', 'postModels', 'templateModels', 'adminModels']

modelDirs.forEach((dir) => {
   const models = require(`./${dir}`)
   Object.keys(models).forEach((modelName) => {
      db[modelName] = models[modelName]
      if (db[modelName].init) {
         db[modelName].init(sequelize)
      }
   })
})

// 2단계: 관계 설정
Object.keys(db).forEach((modelName) => {
   if (db[modelName].associate) {
      db[modelName].associate(db)
   }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
