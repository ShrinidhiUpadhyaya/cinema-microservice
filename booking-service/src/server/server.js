const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyparser = require("body-parser");
const cors = require("cors");
const _api = require("../api/booking");
const os = require("os");

const start = (container) => {
  return new Promise((resolve, reject) => {
    const { port } = container.resolve("serverSettings");
    const repo = container.resolve("repo");

    if (!repo) {
      console.error({
        application: "booking-service",
        system: os.hostname(),
        message: "The server must be started with a connected repository",
        timestamp: Date.now(),
        level: "error",
      });

      reject(
        new Error("The server must be started with a connected repository")
      );
    }
    if (!port) {
      console.error({
        application: "booking-service",
        system: os.hostname(),
        message: "The server must be started with an available port",
        timestamp: Date.now(),
        level: "error",
      });

      reject(new Error("The server must be started with an available port"));
    }

    const app = express();
    app.use(morgan("dev"));
    app.use(bodyparser.json());
    app.use(cors());
    app.use(helmet());
    app.use((err, req, res, next) => {
      console.error({
        application: "booking-service",
        system: os.hostname(),
        message: "Something went wrong!",
        timestamp: Date.now(),
        level: "error",
        reason: err,
      });
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
  });
};

module.exports = Object.assign({}, { start });
