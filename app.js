const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'moviesData.db')
let db = null
const intitializationDBServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
intitializationDBServer()

const convertDBObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}

//GET All Movies

app.get('/movies/', async (request, response) => {
  const getAllMoviesQuery = `
    SELECT * FROM movie;`
  const movieArray = await db.all(getAllMoviesQuery)
  response.send(
    movieArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//POST Movies
app.post('/movies/', async (request, response) => {
  const moviesList = request.body
  const {directorId, movieName, leadActor} = moviesList
  const creatMoviesQuery = `
  INSERT INTO 
  movie (director_id, movie_name,lead_actor)
  VALUES(
     "${directorId}",
     "${movieName}",
     "${leadActor}");`
  const dbResponse = await db.run(creatMoviesQuery)
  response.send('Movie Successfully Added')
})

//GET Specific MovieId

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieIdQuery = `
  SELECT * FROM movie WHERE movie_id = ${movieId};`
  const dbMovieResponse = await db.get(movieIdQuery)
  response.send(convertDBObjectToResponseObject(dbMovieResponse))
})

//PUT Movies Details
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const updateMovieDetails = request.body
  const {directorId, movieName, leadActor} = updateMovieDetails
  const updateMovieQuery = `
  UPDATE
  movie
  SET
  director_id = "${directorId}",
  movie_name = "${movieName}",
  lead_actor = "${leadActor}"
  WHERE
  movie_id = ${movieId}
  `
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete Movie
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
  DELETE FROM movie WHERE movie_id = ${movieId};`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

//Get Directors
app.get('/directors/', async (request, response) => {
  const getDirector = `
  SELECT * FROM director;`
  const directorList = await db.all(getDirector)
  response.send(
    directorList.map(eachdirector =>
      convertDBObjectToResponseObject(eachdirector),
    ),
  )
})

//Get Specific directorsId
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
  SELECT movie_name FROM movie WHERE director_id = ${directorId};`
  const directorMovieList = await db.all(getDirectorMoviesQuery)
  response.send(
    directorMovieList.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
