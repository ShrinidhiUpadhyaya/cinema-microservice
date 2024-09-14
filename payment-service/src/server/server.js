const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyparser = require("body-parser");
const cors = require("cors");
const _api = require("../api/payment");
const logger = require("../config/logger");

const start = (container) => {
  return new Promise((resolve, reject) => {
    logger.trace("Starting server initialization");

    const { port } = container.resolve("serverSettings");
    const repo = container.resolve("repo");

    if (!repo) {
      logger.fatal("The server must be started with a connected repository");
      reject(
        new Error("The server must be started with a connected repository")
      );
    }
    if (!port) {
      logger.fatal("The server must be started with a connected repository");
      reject(new Error("The server must be started with an available port"));
    }

    const app = express();
    app.use(morgan("dev"));
    app.use(bodyparser.json());
    app.use(cors());
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
      next();
    });
    app.use((req, res, next) => {
      req.container = container.createScope();
      next();
    });

    const api = _api.bind(null, { repo });
    api(app);

    const server = app.listen(port, () => resolve(server));

    logger.trace("Exiting server start");
  });
};

module.exports = Object.assign({}, { start });
