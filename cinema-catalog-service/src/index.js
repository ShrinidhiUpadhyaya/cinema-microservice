"use strict";
const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const config = require("./config/");
const mediator = new EventEmitter();
const logger = require("./config/logger");
const os = require("os");

logger.info("---- APPLICATION INIT ----");

const handleShutdown = (err) => {
  logger.fatal(
    {
      reason: err,
      type: os?.type(),
      cpuUsage: process?.cpuUsage(),
      memoryUsage: process?.memoryUsage(),
      loadAverage: os?.loadavg(),
      uptime: process?.uptime(),
    },
    "Application Stopped"
  );
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
process.on("SIGSEGV", handleShutdown);
process.on("SIGILL", handleShutdown);
process.on("SIGABRT", handleShutdown);
process.on("SIGFPE", handleShutdown);

process.on("uncaughtRejection", handleShutdown);
process.on("uncaughtException", handleShutdown);

mediator.on("db.ready", (db) => {
  let rep;
  repository
    .connect({ db, ObjectID: config.ObjectID })
    .then((repo) => {
      rep = repo;

      // use macros or common hardcoded strings for messages or strings.

      logger.info(
        {
          port: config?.serverSettings?.port,
          ssl: config?.serverSettings?.ssl,
          ObjectID: config?.ObjectID,
        },
        "configuration settings"
      );

      return server.start({
        port: config.serverSettings.port,
        ssl: config.serverSettings.ssl,
        repo,
      });
    })
    .then((app) => {
      logger.info(
        {
          port: port,
        },
        "Application Started"
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
