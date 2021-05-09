const Sequelize = require('sequelize');
const connection = require('../database/database');
const Category = require('../categories/Category')

const Article = connection.define('articles', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    slug: {
        type: Sequelize.STRING,
        allowNull: false
    },
    body: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});
 
// One Article belongs to one Category
Article.belongsTo(Category);
// One Category has many Articles
Category.hasMany(Article);

Article.sync({force: false})

module.exports = Article;