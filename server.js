const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');

//creation of database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = app;

//Middleware
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(errorHandler());

//Importing/Mounting Routers
const employeeRouter = require('./api/employeeRouter.js');
app.use('/api/employees', employeeRouter);

const menusRouter = require('./api/menusRouter.js');
app.use('/api/menus', menusRouter)

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
