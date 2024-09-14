"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/movies", (req, res, next) => {
    logger.info(
      {
        method: req?.method,
        api: req?.originalUrl,
      },
      "Request"
    );

    repo
      .getAllMovies()
      .then((movies) => {
        logger.debug({ movies: movies }, "getAllMovies successfull");
        res.status(status.OK).json(movies);
      })
      .catch(next);
  });

  app.get("/movies/premieres", (req, res, next) => {
    logger.info(
      {
        method: req?.method,
        api: req?.originalUrl,
      },
      "Request"
    );
    repo
      .getMoviePremiers()
      .then((movies) => {
        logger.debug({ movies: movies }, "getMoviePremiers successfull");
        res.status(status.OK).json(movies);
      })
      .catch(next);
  });

  app.get("/movies/:id", (req, res, next) => {
    const id = req?.params?.id;

    logger.info(
      {
        method: req?.method,
        api: req?.originalUrl,
        input: id,
      },
      "Request"
    );
    repo
      .getMovieById(id)
      .then((movie) => {
        logger.debug({ movie: movie }, "getMovieById successfull");
        res.status(status.OK).json(movie);
      })
      .catch(next);
  });
};
