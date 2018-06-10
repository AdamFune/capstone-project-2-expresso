const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//GET all menuItems for a single menu
menuItemRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId', {
    $menuId: req.params.menuId
  }, (error, menuItems) => {
    if (error) {
      next(error);
    } else {
      res.send({menuItems: menuItems});
    };
  });
})

//POST new menuItem;
menuItemRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;

  if (!name || !description || !inventory || ! price) {
    return res.status(400).send();
  };

  db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id)
          VALUES ($name, $description, $inventory, $price, $menuId)`, {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: req.params.menuId
          }, function(error) {
            if(error) {
              next(error);
            };
            db.get('SELECT * FROM MenuItem WHERE id = $id', {$id: this.lastID}, (err, item) => {
              if(error) {
                return next(error);
              } else {
                res.status(201).send({menuItem: item});
              };
            });
          });
})
//Setting up parameters
menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get('SELECT * FROM MenuItem WHERE id = $id', {$id: menuItemId}, (error, item) => {
    if (error) {
      next(error)
    } else if (item) {
      req.menuItem = item;
      next();
    } else {
      res.status(404).send();
    };
  });
})

//PUT to update menuItem;
menuItemRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;

  if (!name || !description || !inventory || ! price) {
    return res.status(400).send();
  };

  db.run(`UPDATE MenuItem
          SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId
          WHERE id = $id`, {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: req.params.menuId,
            $id: req.params.menuItemId
          }, function(error) {
            if(error) {
              return next(error);
            };
            db.get('SELECT * FROM MenuItem WHERE id = $id', {$id: req.params.menuItemId}, (err, item) => {
              if(error) {
                next(error);
              } else {
                res.send({menuItem: item});
              };
            });
          });
})

menuItemRouter.delete('/:menuItemId', (req, res, next) => {
  db.run('DELETE FROM MenuItem WHERE id = $id', {$id: req.params.menuItemId}, (err) => {
    if (err) {
      next(err);
    } else {
      res.status(204).send();
    }
  })
})

module.exports = menuItemRouter;
