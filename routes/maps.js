const express = require("express");
// router is a smaller module from express
const router = express.Router();

const { Pool } = require("pg");
const dbParams = require("../lib/db.js");
const db = new Pool(dbParams);
db.connect();

// TEMPLATE FOR ROUTES
// module.exports = (db) => {
//   router.get("/", (req, res) => {

//   });
//   return router;
// };

module.exports = (db) => {
  //rendering a newmap page
  router.get("/new", (req, res) => {
    //app.use("/maps", mapRoutes(db)); from server file is a base, then we add /new
    res.render("new");
  });

  // renders maps from href link on landing page
  router.get("/:id", (req, res) => {
    const mapId = req.params.id;
    db.query(
      `SELECT *
    FROM maps
    JOIN points ON maps.id = points.map_id
    WHERE maps.id = $1`, [mapId]
    )
      .then((data) => {
        console.log(data);
        res.render("viewMap");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err.message });
      });
  });
  // redirects from map title

  //
  router.post("/", (req, res) => {
    const addMap = function (map) {
      const queryParams = [map["title"], map["description"]];

      const queryString = `INSERT INTO maps (title, description) VALUES ($1, $2) RETURNING *;`;
      return pool.query(queryString, queryParams).then((res) => res.rows);
    };
  });
  return router;
};
