/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/profile", (req, res) => {
    // const userId = req.params.id;
    db.query(
      `SELECT users.name AS user_name, users.id AS user_id, maps.title AS map_title, maps.created_by AS map_owner FROM users
      JOIN maps ON users.id = maps.created_by;`)
      .then(data => {
        const userMaps = data.rows;
        console.log(userMaps)
        res.json({ userMaps });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};
