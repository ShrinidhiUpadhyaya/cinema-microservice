"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/cinemas", (req, res, next) => {
    const cityId = req?.query?.cityId;

    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
      input: cityId,
    });

    repo
      .getCinemasByCity(cityId)
      .then((cinemas) => {
        logger.debug("getCinemasByCity successfull", {
          values: cinemas,
        });
        res.status(status.OK).json(cinemas);
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

  app.get("/cinemas/:cinemaId", (req, res, next) => {
    const cinemaId = req?.params?.cinemaId;

    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
      input: cinemaId,
    });

    repo
      .getCinemaById(cinemaId)
      .then((cinema) => {
        logger.debug("getCinemaById successfull", {
          values: cinema,
        });
        res.status(status.OK).json(cinema);
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

  app.get("/cinemas/:cityId/:movieId", (req, res, next) => {
    const params = {
      cityId: req?.params.cityId,
      movieId: req?.params.movieId,
    };

    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
      input: params,
    });

    repo
      .getCinemaScheduleByMovie(params)
      .then((schedules) => {
        logger.debug("getCinemaScheduleByMovie successfull", {
          values: schedules,
        });
        res.status(status.OK).json(schedules);
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
