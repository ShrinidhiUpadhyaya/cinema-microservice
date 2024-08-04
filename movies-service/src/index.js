"use strict";
const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const config = require("./config");
const mediator = new EventEmitter();
const logger = require("./config/logger");

const loggerInit = logger.init({
  name: "booking-service",
  description: "a service for booking cinema tickets",
});

if (loggerInit == 0) {
  mediator.on("db.ready", (db) => {
    let rep;
    repository
      .connect(db)
      .then((repo) => {
        rep = repo;
        logger.logger.info("configuration settings", {
          serverSettings: config?.serverSettings,
          dbSettings: config?.dbSettings,
        });
        return server.start({
          port: config.serverSettings.port,
          ssl: config.serverSettings.ssl,
          repo,
        });
      })
      .then((app) => {
        logger.logger.info(
          `Server started succesfully, running on port: ${config.serverSettings.port} `
        );
        app.on("close", () => {
          rep.disconnect();
        });
      });
  });

  mediator.on("db.error", (err) => {
    console.error(err);
  });

  config.db.connect(config.dbSettings, mediator);

  mediator.emit("boot.ready");
}
