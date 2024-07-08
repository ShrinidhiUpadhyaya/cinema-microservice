"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/movies", (req, res, next) => {
    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
    });

    childLogger.info("Request");

    repo
      .getAllMovies()
      .then((movies) => {
        childLogger.trace(
          {
            values: { movies },
          },
          "getAllMovies successfull"
        );
        res.status(status.OK).json(movies);
      })
      .catch(next);
  });

  app.get("/movies/premieres", (req, res, next) => {
    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
    });

    childLogger.info("Request");
    repo
      .getMoviePremiers()
      .then((movies) => {
        childLogger.trace(
          {
            values: { movies },
          },
          "getMoviePremiers successfull"
        );
        res.status(status.OK).json(movies);
      })
      .catch(next);
  });

  app.get("/movies/:id", (req, res, next) => {
    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
      input: req.params.id,
    });

    childLogger.info("Request");
    repo
      .getMovieById(req.params.id)
      .then((movie) => {
        childLogger.trace(
          {
            values: { movie },
          },
          "getMovieById successfull"
        );
        res.status(status.OK).json(movie);
      })
      .catch(next);
  });
};
