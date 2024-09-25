"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = (app, options) => {
  const { repo } = options;

  app.get("/cinemas", (req, res, next) => {
    const cityId = req?.query?.cityId;

    logger.info(
      {
        method: req?.method,
        api: req?.originalUrl,
        input: cityId,
      },
      "Request /cinemas"
    );

    repo
      .getCinemasByCity(cityId)
      .then((cinemas) => {
        logger.debug({ cinemas: cinemas }, "getCinemasByCity successfull");
        res.status(status.OK).json(cinemas);
      })
      .catch((err) => {
        logger.error(
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

    logger.info(
      {
        method: req?.method,
        api: req?.originalUrl,
        input: cinemaId,
      },
      "Request /cinemas/:cinemaId"
    );

    repo
      .getCinemaById(cinemaId)
      .then((cinema) => {
        logger.debug({ cinema: cinema }, "getCinemaById successfull");
        res.status(status.OK).json(cinema);
      })
      .catch((err) => {
        logger.error(
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

    logger.info(
      {
        method: req?.method,
        api: req?.originalUrl,
        input: params,
      },
      "Request /cinemas/:cityId/:movieId"
    );

    repo
      .getCinemaScheduleByMovie(params)
      .then((schedules) => {
        logger.debug(
          { schedules: schedules },
          "getCinemaScheduleByMovie successfull"
        );
        res.status(status.OK).json(schedules);
      })
      .catch((err) => {
        logger.error(
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
