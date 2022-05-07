const express = require('express');
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

const addMap = function(db, map, userid) {//adding map to db, so far without a user, used in a "post" below

  const queryParams = [map.title, map.description, userid];
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

const queryStringMaps = `SELECT
  maps.title AS map_title,
  maps.description AS map_description,
  users.name AS user_name
  FROM maps
  JOIN users ON users.id = maps.created_by
  WHERE users.id = $1`;

const queryStringPoints = `SELECT maps.title AS map_title, points.latitude,
    points.longitude, points.id,
    points.title,
    points.description,
    points.image,
    points.created_by,
    points.map_id,
    points.created_at,
    points.deleted_at,
    users.name AS user_name
    FROM maps
    LEFT JOIN points ON maps.id = points.map_id
    LEFT JOIN users ON users.id = points.created_by
    WHERE maps.id=$1;`


const altQuery = `select points.id,
points.latitude,
points.longitude,
points.title,
points.created_by,
points.image,
points.description,
users.name AS user_name,
maps.id AS map_id
from points
join users on users.id= points.created_by
join maps on maps.id = points.map_id
where maps.id = $1;`;

module.exports = (db) => {//rendering a newmap page
  router.get("/new", (req, res) => {//app.use("/maps", mapRoutes(db)); from server file is a base, then we add /new
    const userid = req.session.userid;
    res.render('new', {userid})
  });
  router.get("/viewMap", (req, res) => {
    const userid = req.session.userid;
    res.render('viewMap', {userid})
  });
//saving a map
  router.post("/new", (req, res) => {//post method to save maps to db, using a function writen above
    console.log("this is reqbody:", req.body)
    const userid = req.session.userid;
    if (!userid) {
      // reject add map
      res.redirect(`/users/login`)
    } else {
      addMap(db, req.body, userid).then(result => {
        console.log({ result })
        res.redirect(`/maps/${result.id}/points`)
      })
    }

  })

  router.post("/new/:id/delete", (req, res) => {
    deleteMAP(db, req.params.id).then(result => {
     res.redirect("/") //Once a maps is removed it reloads the page
   })
  })

    //to get the points from db, LEFT JOIN allows join table while points row is NULL
  router.get("/:id/points", (req, res) => {

    const userid = req.session.userid;
    Promise.all([
      db.query(altQuery, [req.params.id]),
        db.query(queryStringMaps, [userid])
      ])
      .then(([res1, res2]) => {
        console.log('this is res1: ', res1)
        return {
        pointsInfo: res1.rows,
        mapsInfo: res2.rows
      }}
      ).then(data => {
      res.render("points", { mapId: req.params.id, data, userid });
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .json({ error: err.message });
    });
  });

   // renders maps from href link on landing page
   router.get("/:id", (req, res) => {
    const mapId = req.params.id;
    db.query(

      `SELECT
      maps.title AS map_title,
      maps.description AS map_description,
      points.title AS point_title,
      points.description AS point_description,
      maps.id AS map_id,
      points.latitude,
      points.longitude,
      points.image AS point_image,
      users.name AS createdby
    FROM maps
    LEFT JOIN points ON maps.id = points.map_id
    LEFT JOIN users ON users.id = points.created_by
    WHERE maps.id = $1;`, [mapId]
    )
      .then((data) => {
        const mapPoints = data.rows;

        const userid = req.session.userid;
        res.render("viewMap", { mapPoints, userid, mapId });

//         console.log(mapPoints)
//         res.render("viewMap", { mapPoints, mapId });

      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err.message });
      });
  });

  return router;
};
