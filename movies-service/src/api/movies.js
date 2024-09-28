"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/movies", (req, res, next) => {
    logger.info(
      {
        method: req?.method,
      },
      "Request /movies"
    );

    repo
      .getAllMovies()
      .then((movies) => {
        logger.debug({ movies: movies }, "getAllMovies successfull");
        res.status(status.OK).json(movies);
      })
      .catch((err) => {
        logger.error(
          {
            reason: err?.message,
            stackTrace: err?.stackTrace,
            method: req?.method,
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
          },
          "Error occured /movies"
        );
        next(err);
      });
  });

  app.get("/movies/premieres", (req, res, next) => {
    logger.info(
      {
        method: req?.method,
      },
      "Request /movies/premieres"
    );
    repo
      .getMoviePremiers()
      .then((movies) => {
        logger.debug({ movies: movies }, "getMoviePremiers successfull");
        res.status(status.OK).json(movies);
      })
      .catch((err) => {
        logger.error(
          {
            reason: err?.message,
            stackTrace: err?.stackTrace,
            method: req?.method,
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
          },
          "Error occured /movies/premieres"
        );
        next(err);
      });
  });

  app.get("/movies/:id", (req, res, next) => {
    const id = req?.params?.id;

    logger.info(
      {
        method: req?.method,
        input: id,
      },
      "Request /movies/:id"
    );
    repo
      .getMovieById(id)
      .then((movie) => {
        logger.debug({ movie: movie }, "getMovieById successfull");
        res.status(status.OK).json(movie);
      })
      .catch((err) => {
        logger.error(
          {
            reason: err?.message,
            stackTrace: err?.stackTrace,
            method: req?.method,
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
          },
          "Error occured /movies/:id"
        );
        next(err);
      });
  });
};
