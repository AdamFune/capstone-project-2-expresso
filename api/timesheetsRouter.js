const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true}); //Remember this when exporting a router that will use another routers parameters!!
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//GET all timesheets of an existing employee;
timesheetsRouter.get('/', (req, res, next) =>{
  db.all('SELECT * FROM Timesheet WHERE employee_id = $id', {$id: req.params.employeeId}, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({timesheets: timesheets});
    }
  });
})

//Create new timesheet, related to the employee with the supplies employee_id
timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;

  if (!hours || !rate || !date) {
    return res.status(400).send();
  }
  db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id)
          VALUES ($hours, $rate, $date, $employeeId)`, {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employeeId: req.params.employeeId
          }, function (error) {
            if (error) {
              next(error)
            };
            db.get('SELECT * FROM Timesheet WHERE id = $id', {$id: this.lastID}, (error, timesheet) =>{
              if (error) {
                next(error);
              } else {
                res.status(201).send({timesheet:timesheet});
              };
            });
          });
})

//Setting up parameters
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) =>{
  db.get(`SELECT * FROM Timesheet
          WHERE id = $id`, {$id: timesheetId}, (error, timesheet)=> {
            if (error) {
              return next(error);
            } else {
              if (timesheet) {
                req.timesheet = timesheet;
                next();
              } else {
                res.status(404).send();
              };
            };
          });
})

//PUT to update the timesheet with the given ID;
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;

  if (!hours || !rate || !date) {
    return res.status(400).send();
  };

  db.run(`UPDATE Timesheet
          SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId
          WHERE id = $id`,{
            $hours: hours,
            $rate: rate,
            $date: date,
            $employeeId: req.params.employeeId,
            $id: req.params.timesheetId
          }, error=> {
            if (error) {
              return next(error);
            };
            db.get('SELECT * FROM Timesheet WHERE id = $id', {$id: req.params.timesheetId}, (error, timesheet)=>{
              if(error) {
                next(error);
              } else {
                res.send({timesheet:timesheet});
              };
            });
          });
})

//DELETE timesheet with sepcified ID;
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run(`DELETE FROM Timesheet WHERE id = $id`, {$id: req.params.timesheetId}, (error) => {
    if (error) {
      next(error);
    } else {
      res.status(204).send();
    };
  });
})




module.exports = timesheetsRouter;
