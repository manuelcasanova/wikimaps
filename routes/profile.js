const express = require('express');
const router  = express.Router();

module.exports = (db) => {//rendering points page
  router.get("/profile", (req, res) => {
      res.render("profile");
  })
  return router;
};
