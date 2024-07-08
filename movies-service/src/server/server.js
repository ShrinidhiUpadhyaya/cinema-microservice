const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const spdy = require("spdy");
const api = require("../api/movies");
const logger = require("../config/logger");

const start = (options) => {
  return new Promise((resolve, reject) => {
    if (!options.repo) {
      logger.fatal("The server must be started with a connected repository");
      reject(
        new Error("The server must be started with a connected repository")
      );
    }
    if (!options.port) {
      logger.fatal("The server must be started with a connected repository");
      reject(new Error("The server must be started with an available port"));
    }

    const app = express();
    app.use(morgan("dev"));
    app.use(helmet());
    app.use((err, req, res, next) => {
      logger.fatal(
        {
          reason: err,
        },
        "Something went wrong!"
      );
      reject(new Error("Something went wrong!, err:" + err));
      res.status(500).send("Something went wrong!");
    });

    api(app, options);

    // http;
    const server = app.listen(options.port, () => resolve(server));

    // https
    // const server = spdy
    //   .createServer(options.ssl, app)
    //   .listen(options.port, () => resolve(server));
  });
};

module.exports = Object.assign({}, { start });
