const express = require('express');
const router  = express.Router();

//step2
const addPin = function(db, pin) {
  const queryParams = [pin.title, pin.description, pin.image, pin.latitude, pin.longitude, pin.mapId];
  let queryString = ` INSERT INTO points (
    title,
    description,
    image,
    latitude,
    longitude,
    map_id
  ) VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;`;
  return db.query(queryString, queryParams).then((res) => res.rows[0]);
};

//pin deleting
const deletePin = function(db, id) {
  const queryParams = [id];
  let queryString = `DELETE FROM points WHERE id = $1 RETURNING *`;
  return db.query(queryString, queryParams).then((res) => res.rows[0]);
};

module.exports = (db) => {
  router.post("/points", (req, res) => {//post method to save points to the data base, the next step is to write the function(step2)
    addPin(db, req.body).then(result => {
      console.log(result)
      res.redirect(`/maps/${req.body.mapId}/points`) //Once a pin is added it reloads the page and shows the pin at the bottom
    })
  })

  router.post("/points/:id/delete", (req, res) => {
    deletePin(db, req.params.id).then(result => {
     res.redirect("/maps/points") //Once a pin is removed it reloads the page
   })
 })


  // router.get("/points/:map_id", (req, res) => {//to get the points from db

  //   db.query(`select points.latitude,
  //   points.longitude, points.id,
  //   points.title,
  //   points.description,
  //   points.image,
  //   points.created_by,
  //   points.map_id,
  //   points.created_at,
  //   points.deleted_at from points
  //   where points.map_id=[];`)

  //   .then(data => {
  //     const points = data.rows;
  //     console.log("this is points: ", points)
  //     // res.json({ maps });
  //     res.render("points", { points });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     res
  //       .status(500)
  //       .json({ error: err.message });
  //   });
  // });

  return router;
};


