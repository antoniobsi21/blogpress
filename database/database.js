const { Sequelize } = require('sequelize');

const connection = new Sequelize('blogpress', 'databaseuser', 'databaseuserpassword', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-03:00'
});

module.exports = connection;
