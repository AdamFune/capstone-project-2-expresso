const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//GET all menus;
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    if (error) {
      next(error);
    } else {
      res.send({menus: menus});
    };
  });
})


//POST to create valid menu;
menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.status(400).send();
  };

  db.run(`INSERT INTO Menu (title)
          VALUES ($title)`, {
            $title: title
          }, function(error) {
            if (error) {
              return next(error);
            };
            db.get('SELECT * FROM Menu WHERE id = $id', {$id: this.lastID}, (error, menu) => {
              if (error) {
                next(error);
              } else {
                res.status(201).send({menu: menu});
              };
            });
          });
})

// Setting up parameters;
menusRouter.param('menuId', (req, res, next, menuId) =>{
  db.get(`SELECT * FROM Menu WHERE id = $id`, {$id: menuId}, (error, menu)=> {
    if (error) {
      next(error);
    } else {
      if (menu) {
        req.menu = menu;
        next();
      } else {
        res.status(404).send();
      };
    };
  });
})

//GET menu with given id;
menusRouter.get('/:menuId', (req, res, next) => {
  res.send({menu: req.menu});
})

//PUT to update menu based on id;
menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.status(400).send();
  };

  db.run(`UPDATE Menu
          SET title = $title
          WHERE id = $id`, {
            $title: title,
            $id: req.params.menuId
          }, function(error) {
            if(error) {
              next(error);
            };
            db.get('SELECT * FROM Menu WHERE id = $id', {
              $id: req.params.menuId
            }, (error, menu) => {
              if (error) {
                next(error);
              } else {
                res.send({menu: menu});
              };
            });
          });
})

//DELETE menu based on id if no related menu items;
menusRouter.delete('/:menuId', (req, res, next) => {
  db.get('SELECT * FROM MenuItem WHERE menu_id = $id', {$id: req.params.menuId}, (error, MenuItem) => {
    if (error) {
      next(error);
    } else if (MenuItem) {
      res.status(400).send();
    } else {
      db.run(`DELETE FROM Menu WHERE id = $id`, {$id: req.params.menuId}, error => {
        if (error) {
          next(error);
        } else {
          res.status(204).send();
        };
      });
    };
  });

})


//Importing and mounting menuItemRouter;
const menuItemRouter = require('./menuItemRouter.js');
menusRouter.use('/:menuId/menu-items', menuItemRouter);


module.exports = menusRouter;
