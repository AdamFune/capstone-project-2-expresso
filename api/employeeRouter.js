const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//GET all saved, currently-employed employees;
employeeRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee
          WHERE is_current_employee = 1`, (err, employees) => {
            if (err) {
              next(err);
            } else {
              res.send({employees: employees});
            };
          });
})


//Setting parameters
employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee
          WHERE id = $employeeId`, {
            $employeeId: employeeId
          }, (err, employee) => {
            if (err) {
              next(err);
            } else if (employee) {
              req.employee = employee;
              next();
            } else {
              res.status(404).send();
            };
          })
})

//GET employee by id;
employeeRouter.get('/:employeeId', (req, res, next) => {
  res.send({employee: req.employee});
})


//POST creates a new employee with the information from the employee property
employeeRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  if (!name || !position || !wage) {
    return res.status(400).send();
  };

  db.run(`INSERT INTO Employee (name, position, wage)
          VALUES ($name, $position, $wage)`, {
            $name: name,
            $position: position,
            $wage: wage
          }, function(error) {
            if (error) {
              next(error);
            };
            db.get('SELECT * FROM Employee WHERE id = $id', {$id: this.lastID}, (err, employee) => {
              if (err) {
                next(err);
              } else {
                res.status(201).send({employee: employee});
              }
            })
          })
})


//PUT to update the employee by id;
employeeRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  if (!name || !position || !wage) {
    return res.status(400).send();
  };

  db.run(`UPDATE Employee
          SET name = $name, position = $position, wage = $wage
          WHERE id = $id`, {
            $name: name,
            $position: position,
            $wage: wage,
            $id: req.params.employeeId
          }, function(error) {
            if (error) {
              return next(error);
            };
            db.get('SELECT * FROM Employee WHERE id = $id', {$id: req.params.employeeId}, (err, employee) =>{
              if (err) {
                next(err);
              } else {
                res.status(200).send({employee: employee});
              };
            });
          });
})

//DELETE employee by id;
employeeRouter.delete('/:employeeId', (req, res, next) => {
  db.run(`UPDATE Employee
          SET is_current_employee = 0
          WHERE id = $id`, {$id: req.params.employeeId}, function (error){
            if (error) {
              next(error);
            };
            db.get('SELECT * FROM Employee WHERE id = $id', {$id: req.params.employeeId}, (error, employee) => {
              if (error) {
                next(error);
              } else {
                res.send({employee: employee});
              };
            });
          });
})

//importing and mounting timesheetsRouter;
const timesheetsRouter = require('./timesheetsRouter.js');
employeeRouter.use('/:employeeId/timesheets', timesheetsRouter);

module.exports = employeeRouter;
