const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const api = require("../api/cinema-catalog");
const logger = require("../config/logger");

const start = (options) => {
  return new Promise((resolve, reject) => {
    logger.log("Starting server initialization");

    if (!options.repo) {
      logger.error("The server must be started with a connected repository");

      reject(
        new Error("The server must be started with a connected repository")
      );
    }
    if (!options.port) {
      logger.error("The server must be started with an available port");

      reject(new Error("The server must be started with an available port"));
    }

    const app = express();
    app.use(morgan("dev"));
    app.use(helmet());
    app.use((err, req, res, next) => {
      logger.error("Something went wrong!", {
        reason: err,
      });
      reject(new Error("Something went wrong!, err:" + err));
      res.status(500).send("Something went wrong!");
    });

    api(app, options);

    const server = app.listen(options.port, () => resolve(server));

    logger.log("Exiting server start");
  });
};

module.exports = Object.assign({}, { start });
