const express = require("express");
// router is a smaller module from express
const router = express.Router();

const { Pool } = require("pg");
const dbParams = require("../lib/db.js");
const db = new Pool(dbParams);
db.connect();


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
      `SELECT maps.title AS map_title, maps.description AS map_description, maps.created_by AS map_owner, points.title AS point_title, points.description AS point_description, points.created_by AS point_owner, users.name AS user_name
    FROM maps
    JOIN points ON maps.id = points.map_id
    JOIN users ON users.id = points.created_by
    WHERE maps.id = $1;`, [mapId]
    )
      .then((data) => {
        const mapPoints = data.rows;
        res.render("viewMap", { mapPoints });
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
