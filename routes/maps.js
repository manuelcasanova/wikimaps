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

const addMap = function(db, map) {//adding map to db, so far without a user, used in a "post" below
  const queryParams = [map.title, map.description, 1];
  //we are passing 1 as a "created_by" for now, but we need to change to a dynamic user id later
  let queryString = ` INSERT INTO maps (
    title,
    description,
    created_by
  ) VALUES ($1, $2, $3)
  RETURNING *;`;
  return db.query(queryString, queryParams).then((res) => res.rows[0]);
};


const deleteMAP = function(db, id) {
  const queryParams = [id];
  let queryString = `DELETE FROM maps WHERE id = $1 RETURNING *`;
  console.log(queryParams, queryString);
  return db.query(queryString, queryParams).then((res) => res.rows[0]);
};

module.exports = (db) => {//rendering a newmap page
  router.get("/new", (req, res) => {//app.use("/maps", mapRoutes(db)); from server file is a base, then we add /new
      res.render("new");
  });
  
  
  router.get("/viewMap", (req, res) => {
    res.render("viewMap");
  });
  
  
//saving a map
  router.post("/new", (req, res) => {//post method to save maps to db, using a function wrriten above
    console.log("this is reqbody:", req.body)
    addMap(db, req.body).then(result => {
      console.log(result)
      res.redirect("points")
    })
  })
  

  router.post("/new/:id/delete", (req, res) => {
    deleteMAP(db, req.params.id).then(result => {
     res.redirect("/") //Once a maps is removed it reloads the page
   })
  })
  
  
   // renders maps from href link on landing page
  router.get("/:id", (req, res) => {
    const mapId = req.params.id;
    db.query(
      `SELECT *
    FROM maps
    JOIN points ON maps.id = points.map_id
    WHERE maps.id = $1;`, [mapId]
    )
      .then((data) => {

        const mapPoints = data.rows;
        console.log('DESTRUCTURED: ', { mapPoints });
        res.render("viewMap", { mapPoints });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err.message });
      });
  });
  
  // redirects from map title
  router.post("/", (req, res) => {
    const addMap = function (map) {
      const queryParams = [map["title"], map["description"]];

      const queryString = `INSERT INTO maps (title, description) VALUES ($1, $2) RETURNING *;`;
      return pool.query(queryString, queryParams).then((res) => res.rows);
    }; 
  });
  
  return router;
};
