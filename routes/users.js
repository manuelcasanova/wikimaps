/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();


// const userData = function(db, userid) {
//   const queryString = `SELECT users.*,
//   maps.id AS map_id,
//   maps.title AS map_title,
//   maps.description AS map_description
//   FROM users
//   LEFT JOIN maps ON users.id = map.created_by
//   WHERE users.id = $1;`;
//   return db.query(queryString)
//   .then((res) => res.rows);
// };


module.exports = (db) => {
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get('/login', (req, res) => {
    const userid = req.session.userid;
    res.render('login', {userid})
  });

  router.post('/login', (req, res) => {
    // using encrypted cookies
    req.session.userid = req.body.userid;
    // send the user somewhere
    res.redirect(`/`);
  });

  router.post("/logout", (req, res) => {
    req.session = null; //To destroy a session instead of `cookie parser res.clearCookie("userID");`
    res.redirect('/');
  });

  router.get("/profile/:id", (req, res) => {
    const signedInUser = req.params.id;
    db.query(`SELECT users.*,
    maps.id AS map_id,
    maps.title AS map_title,
    maps.description AS map_description
    FROM users
    LEFT JOIN maps ON users.id = maps.created_by
    WHERE users.id = $1;`, [signedInUser]
    )
      .then((data) => {
        const userData = data.rows;

        const userid = req.session.userid;
        res.render("profile", { userData, userid, signedInUser});
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err.message });
      });
  });

  return router;
};

