const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const cors = require('cors');

module.exports = app;

//Middleware
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(errorHandler());
app.use(cors());

//Importing/Mounting Routers
const employeeRouter = require('./api/employeeRouter.js');
app.use('/api/employees', employeeRouter);

const menusRouter = require('./api/menusRouter.js');
app.use('/api/menus', menusRouter)

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
