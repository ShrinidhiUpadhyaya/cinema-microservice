"use strict";
const status = require("http-status");
const { apiLogger, apiErrorLogger } = require("../config/logger");

module.exports = (app, options) => {
  const { repo } = options;

  app.use(apiLogger);

  app.get("/movies", (req, res, next) => {
    repo
      .getAllMovies()
      .then((movies) => {
        logger.debug("getAllMovies successfull", { movies: movies });
        res.status(status.OK).json(movies);
      })
      .catch(next);
  });

  app.get("/movies/premieres", (req, res, next) => {
    repo
      .getMoviePremiers()
      .then((movies) => {
        logger.debug("getMoviePremiers successfull", { movies: movies });
        res.status(status.OK).json(movies);
      })
      .catch(next);
  });

  app.get("/movies/:id", (req, res, next) => {
    repo
      .getMovieById(req.params.id)
      .then((movie) => {
        res.status(status.OK).json(movie);
      })
      .catch(next);
  });

  app.use(apiErrorLogger);
};
