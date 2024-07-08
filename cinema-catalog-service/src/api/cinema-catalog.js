"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/cinemas", (req, res, next) => {
    const cityId = req?.query?.cityId;

    const childLogger = logger.child({
      method: req?.method,
      api: req?.originalUrl,
      input: cityId,
    });

    childLogger.info("Request");

    repo
      .getCinemasByCity(cityId)
      .then((cinemas) => {
        childLogger.trace(
          {
            values: cinemas,
          },
          "getCinemasByCity successfull"
        );
        res.status(status.OK).json(cinemas);
      })
      .catch((err) => {
        childLogger.debug(
          {
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
          },
          "Error occured"
        );

        next(err);
      });
  });

  app.get("/cinemas/:cinemaId", (req, res, next) => {
    const cinemaId = req?.params?.cinemaId;

    const childLogger = logger.child({
      method: req?.method,
      api: req?.originalUrl,
      input: cinemaId,
    });

    childLogger.info("Request");
    repo
      .getCinemaById(cinemaId)
      .then((cinema) => {
        childLogger.trace(
          {
            values: cinema,
          },
          "getCinemaById successfull"
        );
        res.status(status.OK).json(cinema);
      })
      .catch((err) => {
        childLogger.debug(
          {
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
          },
          "Error occured"
        );
        next(err);
      });
  });

  app.get("/cinemas/:cityId/:movieId", (req, res, next) => {
    const params = {
      cityId: req?.params.cityId,
      movieId: req?.params.movieId,
    };

    const childLogger = logger.child({
      method: req?.method,
      api: req?.originalUrl,
      input: params,
    });

    childLogger.info("Request");

    repo
      .getCinemaScheduleByMovie(params)
      .then((schedules) => {
        childLogger.trace(
          {
            values: schedules,
          },
          "getCinemaScheduleByMovie successfull"
        );
        res.status(status.OK).json(schedules);
      })
      .catch((err) => {
        childLogger.debug(
          {
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
          },
          "Error occured"
        );

        next(err);
      });
  });
};
