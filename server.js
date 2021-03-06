// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();


const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ["test"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");

const mapRoutes = require("./routes/maps");
const pointRoutes = require("./routes/points");
// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/users", usersRoutes(db));
app.use("/maps", mapRoutes(db));
// Note: mount other resources here, using the same pattern above
app.use("/maps", pointRoutes(db));

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get("/", (req, res) => {
  db.query(`SELECT
  users.id AS user_id,
  maps.id,
  maps.title,
  maps.description
  FROM maps
  LEFT JOIN users on users.id = maps.created_by
  ;`)
  .then(data => {
    const maps = data.rows;
    const userid = req.session.userid;
    res.render("index", { maps, userid });
  })
  .catch(err => {
    console.log(err);
    res
      .status(500)
      .json({ error: err.message });
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
