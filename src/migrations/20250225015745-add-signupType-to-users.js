'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.addColumn('users', 'signupType', {
         type: Sequelize.ENUM('referrer', 'user'),
         allowNull: false,
         defaultValue: 'user',
      })
   },

   async down(queryInterface, Sequelize) {
      await queryInterface.removeColumn('users', 'signupType')
   },
}
