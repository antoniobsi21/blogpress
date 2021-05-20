# BlogPress
A CRUD project using Node.JS, Express, EJS, Sequelize, etc.

## Install

    npm install

## Run

    node index.js
or

    nodemon index.js
## Database
The project was built using **MySQL** and it requires a database called blogpress. This can be configured in the file "**/database/database.js**".

**database/database.js**
```
const { Sequelize } = require('sequelize');

const connection = new Sequelize('blogpress', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-03:00'
});

module.exports = connection;
```

When you run the **index.js**, the tables will be created on the databse automatically if them doesn't exist.

## Default User
The system creates a default user with email `admin@admin.com` and password `admin`. To change modify or delete the code in `index.js:54~64`.
