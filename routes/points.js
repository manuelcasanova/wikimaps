const express = require('express');
const router  = express.Router();

module.exports = (db) => {//rendering points page
  router.get("/points", (req, res) => {
      res.render("points");
  })
  return router;
};
