"use strict";

const apm = require("elastic-apm-node").start({
  serviceName: "catalog-service",
  secretToken: "",
  apiKey: "",
  serverUrl: "http://apm-server:8200",
  captureBody: "all",
});
const status = require("http-status");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/cinemas", (req, res, next) => {
    const transaction = apm.startTransaction("getCinemasByCity", "request");

    repo
      .getCinemasByCity(req.query.cityId)
      .then((cinemas) => {
        res.status(status.OK).json(cinemas);
      })
      .catch((err) => {
        apm.captureError(err);
        next(err);
      })
      .finally(() => {
        if (transaction) transaction.end();
      });
  });

  app.get("/cinemas/:cinemaId", (req, res, next) => {
    const transaction = apm.startTransaction("getCinemaById", "request");

    repo
      .getCinemaById(req.params.cinemaId)
      .then((cinema) => {
        res.status(status.OK).json(cinema);
      })
      .catch((err) => {
        apm.captureError(err);
        next(err);
      })
      .finally(() => {
        if (transaction) transaction.end();
      });
  });

  app.get("/cinemas/:cityId/:movieId", (req, res, next) => {
    const transaction = apm.startTransaction(
      "getCinemaScheduleByMovie",
      "request"
    );

    const params = {
      cityId: req.params.cityId,
      movieId: req.params.movieId,
    };
    repo
      .getCinemaScheduleByMovie(params)
      .then((schedules) => {
        res.status(status.OK).json(schedules);
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
