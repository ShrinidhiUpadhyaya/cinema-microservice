"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/cinemas", (req, res, next) => {
    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
      input: req.query.cityId,
    });

    childLogger.info("Request");

    repo
      .getCinemasByCity(req.query.cityId)
      .then((cinemas) => {
        childLogger.trace("getCinemasByCity successfull", {
          values: { cinemas },
        });
        res.status(status.OK).json(cinemas);
      })
      .catch((err) => {
        childLogger.debug({
          msg: "Error occured",
          reason: err.message,
          stackTrace: err.stackTrace,
          method: req.method,
          api: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
          statusCode: res.status,
          user: {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          },
          performance: {
            responseTime: res.get("X-Response Time"),
          },
        });

        next(err);
      });
  });

  app.get("/cinemas/:cinemaId", (req, res, next) => {
    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
      input: req.params.cinemaId,
    });

    childLogger.info("Request");
    repo
      .getCinemaById(req.params.cinemaId)
      .then((cinema) => {
        childLogger.trace("getCinemaById successfull", {
          values: { cinema },
        });
        res.status(status.OK).json(cinema);
      })
      .catch((err) => {
        childLogger.debug({
          msg: "Error occured",
          reason: err.message,
          stackTrace: err.stackTrace,
          method: req.method,
          api: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
          statusCode: res.status,
          user: {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          },
          performance: {
            responseTime: res.get("X-Response Time"),
          },
        });
        next(err);
      });
  });

  app.get("/cinemas/:cityId/:movieId", (req, res, next) => {
    const params = {
      cityId: req.params.cityId,
      movieId: req.params.movieId,
    };

    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
      input: params,
    });

    childLogger.info("Request");

    repo
      .getCinemaScheduleByMovie(params)
      .then((schedules) => {
        childLogger.trace("getCinemaScheduleByMovie successfull", {
          values: { schedules },
        });
        res.status(status.OK).json(schedules);
      })
      .catch((err) => {
        childLogger.debug({
          msg: "Error occured",
          reason: err.message,
          stackTrace: err.stackTrace,
          method: req.method,
          api: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
          statusCode: res.status,
          user: {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          },
          performance: {
            responseTime: res.get("X-Response Time"),
          },
        });

        next(err);
      });
  });
};
