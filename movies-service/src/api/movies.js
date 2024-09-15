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
        logger.debug({ movies: movies }, "getAllMovies successfull");
        res.status(status.OK).json(movies);
      })
      .catch((err) => {
        logger.debug("Error occured", {
          reason: err?.message,
          stackTrace: err?.stackTrace,
          method: req?.method,
          api: req?.originalUrl,
          body: req?.body,
          params: req?.params,
          query: req?.query,
          headers: req?.headers,
          statusCode: res?.status,
          user: {
            ip: req?.ip,
            userAgent: req?.get("User-Agent"),
          },
          performance: {
            responseTime: res?.get("X-Response Time"),
          },
        });

        next(err);
      });
  });

  app.get("/movies/premieres", (req, res, next) => {
    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
    });
    repo
      .getMoviePremiers()
      .then((movies) => {
        logger.debug("getMoviePremiers successfull", { movies: movies });
        res.status(status.OK).json(movies);
      })
      .catch((err) => {
        logger.debug("Error occured", {
          reason: err?.message,
          stackTrace: err?.stackTrace,
          method: req?.method,
          api: req?.originalUrl,
          body: req?.body,
          params: req?.params,
          query: req?.query,
          headers: req?.headers,
          statusCode: res?.status,
          user: {
            ip: req?.ip,
            userAgent: req?.get("User-Agent"),
          },
          performance: {
            responseTime: res?.get("X-Response Time"),
          },
        });

        next(err);
      });
  });

  app.get("/movies/:id", (req, res, next) => {
    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
      input: id,
    });
    repo
      .getMovieById(req.params.id)
      .then((movie) => {
        logger.debug("getMovieById successfull", { movie: movie });
        res.status(status.OK).json(movie);
      })
      .catch((err) => {
        logger.debug("Error occured", {
          reason: err?.message,
          stackTrace: err?.stackTrace,
          method: req?.method,
          api: req?.originalUrl,
          body: req?.body,
          params: req?.params,
          query: req?.query,
          headers: req?.headers,
          statusCode: res?.status,
          user: {
            ip: req?.ip,
            userAgent: req?.get("User-Agent"),
          },
          performance: {
            responseTime: res?.get("X-Response Time"),
          },
        });

        next(err);
      });
  });
};
