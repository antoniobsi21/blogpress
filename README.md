# guiapress
A CRUD project using Node.JS, Express, EJS, Sequelize, etc.

## Database
The project was built using **MySQL** and it requires a database called guiapress. This can be configured in the file "**/database/database.js**".

**database/database.js**
```
const { Sequelize } = require('sequelize');

const connection = new Sequelize('guiapress', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-03:00'
});

module.exports = connection;
```

When you run the **index.js**, the tables will be created on the databse automatically if them doesn't exist.
