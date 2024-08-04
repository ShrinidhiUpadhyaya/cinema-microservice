"use strict";

const { init } = require("./config/logger");
init({
  applicationData: {
    name: "movies-service",
    filePath: "/var/log/movies-service/app",
  },
  logRotationData: {
    filename: "/var/log/movies-service/app",
  },
});

const { getLogger } = require("./config/logger");
const logger = getLogger();

const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const config = require("./config");
const mediator = new EventEmitter();

mediator.on("db.ready", (db) => {
  let rep;
  repository
    .connect(db)
    .then((repo) => {
      rep = repo;
      logger.info("configuration settings", {
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
      logger.info(
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
