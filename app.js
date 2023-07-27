const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const camelCase = (obj) => {
  var newObj = {};
  for (d in obj) {
    if (obj.hasOwnProperty(d)) {
      newObj[
        d.replace(/(\_\w)/g, function (k) {
          return k[1].toUpperCase();
        })
      ] = obj[d];
    }
  }
  return newObj;
};

let db = null;

const initialize = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  try {
    app.listen(3003, () => {
      console.log("Server running at http://localhost:3003/");
    });
  } catch (e) {
    console.log(`${e.message}`);
  }
};
initialize();

// API 1
app.get("/movies/", async (request, response) => {
  const getQuery = `SELECT movie_name FROM movie`;
  try {
    const x = await db.all(getQuery);
    const result = x.map((each) => camelCase(each));
    response.send(result);
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const getQuery = `INSERT INTO movie(director_id, movie_name, lead_actor) 
  VALUES (${directorId},'${movieName}','${leadActor}');`;
  try {
    const x = await db.run(getQuery);
    response.send("Movie Successfully Added");
    const movieId = x.lastID;
    console.log({ movieId: movieId });
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  try {
    const x = await db.get(getQuery);
    response.send(camelCase(x));
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const getQuery = `
    UPDATE movie 
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};
    `;
  try {
    const x = db.run(getQuery);
    response.send("Movie Details Updated");
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  try {
    const x = await db.run(getQuery);
    response.send("Movie Removed");
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 6
app.get("/director/", async (request, response) => {
  const getQuery = `SELECT * FROM director;`;
  try {
    const x = await db.all(getQuery);
    response.send(x.map((each) => camelCase(each)));
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  try {
    const x = await db.all(getQuery);
    response.send(x.map((each) => camelCase(each)));
  } catch (e) {
    console.log(`${e.message}`);
  }
});

module.exports = app;
