const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/points", (req, res) => {
   res.render("points")
  });
  return router;
};
