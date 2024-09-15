"use strict";
const status = require("http-status");
const { apiLogger, apiErrorLogger } = require("../config/logger");

module.exports = (app, options) => {
  app.use(apiLogger);
  const { repo } = options;

  app.get("/cinemas", (req, res, next) => {
    repo
      .getCinemasByCity(req.query.cityId)
      .then((cinemas) => {
        logger.debug("getCinemasByCity successfull", { cinemas: cinemas });
        res.status(status.OK).json(cinemas);
      })
      .catch(next);
  });

  app.get("/cinemas/:cinemaId", (req, res, next) => {
    repo
      .getCinemaById(req.params.cinemaId)
      .then((cinema) => {
        logger.debug("getCinemaById successfull", { cinema: cinema });
        res.status(status.OK).json(cinema);
      })
      .catch(next);
  });

  app.get("/cinemas/:cityId/:movieId", (req, res, next) => {
    const params = {
      cityId: req.params.cityId,
      movieId: req.params.movieId,
    };
    repo
      .getCinemaScheduleByMovie(params)
      .then((schedules) => {
        logger.debug("getCinemaScheduleByMovie successfull", {
          schedules: schedules,
        });
        res.status(status.OK).json(schedules);
      })
      .catch(next);
  });

  app.use(apiErrorLogger);
};
