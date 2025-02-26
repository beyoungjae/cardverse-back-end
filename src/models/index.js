// models/index.js
const Sequelize = require('sequelize')
const config = require('../config')[process.env.NODE_ENV || 'development']
const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

// 1단계: 모델 초기화 - User를 먼저 초기화
const User = require('./userModels/user')
if (User.init) {
   User.init(sequelize)
}

// 그 다음 나머지 모델들 초기화
const modelDirs = ['userModels', 'postModels', 'templateModels', 'adminModels']

modelDirs.forEach((dir) => {
   const models = require(`./${dir}`)
   Object.keys(models).forEach((modelName) => {
      // User 모델은 이미 초기화했으므로 건너뜀
      if (modelName !== 'User' && models[modelName].init) {
         models[modelName].init(sequelize)
      }
      db[modelName] = models[modelName]
   })
})

// 2단계: 관계 설정 - 마찬가지로 User를 먼저
if (User.associate) {
   User.associate(db)
}

// 나머지 모델들의 관계 설정
Object.keys(db).forEach((modelName) => {
   if (modelName !== 'User' && db[modelName].associate) {
      db[modelName].associate(db)
   }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
