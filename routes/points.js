const express = require('express');
const router  = express.Router();

//step2
const addPin = function(db, pin) {
  const queryParams = [pin.title, pin.description, pin.image, pin.latitude, pin.longitude];
  let queryString = ` INSERT INTO points (
    title,
    description,
    image,
    latitude,
    longitude
  ) VALUES ($1, $2, $3, $4, $5)
  RETURNING *;`;
  return db.query(queryString, queryParams).then((res) => res.rows[0]);
};



module.exports = (db) => {
  // router.get("/points", (req, res) => {
  //  res.render("points")
  // });
  router.post("/points", (req, res) => {//post method to save points to the data base, the next step is to write the function(step2)
    addPin(db, req.body).then(result => {
      console.log(result)
      // res.render("points")
    })
  })
  router.get("/points", (req, res) => {
    db.query(`select points.title, points.description from points;`)
    .then(data => {
      const points = data.rows;
      console.log("this is points: ", points)
      // res.json({ maps });
      res.render("points", { points });
    })
    .catch(err => {
      console.log(err);
      res
        .status(500)
        .json({ error: err.message });
    });
  });


  return router;
};



