"use strict";

const apm = require("elastic-apm-node").start({
  serviceName: "movies-service",
  secretToken: "",
  apiKey: "",
  serverUrl: "http://apm-server:8200",
  captureBody: "all",
});
const status = require("http-status");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/movies", (req, res, next) => {
    const transaction = apm.startTransaction("getAllMovies", "request");

    repo
      .getAllMovies()
      .then((movies) => {
        res.status(status.OK).json(movies);
      })
      .catch((err) => {
        apm.captureError(err);
        next(err);
      })
      .finally(() => {
        if (transaction) transaction.end();
      });
  });

  app.get("/movies/premieres", (req, res, next) => {
    const transaction = apm.startTransaction("getMoviePremieres", "request");

    repo
      .getMoviePremiers()
      .then((movies) => {
        res.status(status.OK).json(movies);
      })
      .catch((err) => {
        apm.captureError(err);
        next(err);
      })
      .finally(() => {
        if (transaction) transaction.end();
      });
  });

  app.get("/movies/:id", (req, res, next) => {
    const transaction = apm.startTransaction("getMovieById", "request");

    repo
      .getMovieById(req.params.id)
      .then((movie) => {
        res.status(status.OK).json(movie);
      })
      .catch((err) => {
        apm.captureError(err);
        next(err);
      })
      .finally(() => {
        if (transaction) transaction.end();
      });
  });
};
