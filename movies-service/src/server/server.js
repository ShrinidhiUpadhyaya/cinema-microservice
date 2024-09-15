const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const spdy = require("spdy");
const api = require("../api/movies");
const { getLogger } = require("../config/logger");
const logger = getLogger();

const start = (options) => {
  return new Promise((resolve, reject) => {
    logger.silly("Starting server initialization");

    if (!options.repo) {
      logger.error("The server must be started with a connected repository", {
        options: options,
      });

      reject(
        new Error("The server must be started with a connected repository")
      );
    }
    if (!options.port) {
      logger.error("The server must be started with an available port", {
        options: options,
      });

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

    // http
    const server = app.listen(options.port, () => resolve(server));

    // https
    // const server = spdy
    //   .createServer(options.ssl, app)
    //   .listen(options.port, () => resolve(server));
    logger.silly("Exiting server start");
  });
};

module.exports = Object.assign({}, { start });
