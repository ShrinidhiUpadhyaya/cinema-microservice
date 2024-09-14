"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/movies", (req, res, next) => {
    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
    });

    repo
      .getAllMovies()
      .then((movies) => {
        logger.debug("getAllMovies successfull", {
          values: movies,
        });
        res.status(status.OK).json(movies);
      })
      .catch(next);
  });

  app.get("/movies/premieres", (req, res, next) => {
    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
    });
    repo
      .getMoviePremiers()
      .then((movies) => {
        logger.debug("getMoviePremiers successfull", {
          values: movies,
        });
        res.status(status.OK).json(movies);
      })
      .catch(next);
  });

  app.get("/movies/:id", (req, res, next) => {
    const id = req?.params?.id;

    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
      input: id,
    });
    repo
      .getMovieById(id)
      .then((movie) => {
        logger.debug("getMovieById successfull", {
          values: movie,
        });
        res.status(status.OK).json(movie);
      })
      .catch(next);
  });
};
