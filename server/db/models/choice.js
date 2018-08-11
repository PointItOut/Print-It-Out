const Sequelize = require('sequelize')
const db = require('../db')

const Choice = db.define('choices', {
  theChoice: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {notEmpty: true}
  },
  isCorrect: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  isPicture: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
})

module.exports = Choice