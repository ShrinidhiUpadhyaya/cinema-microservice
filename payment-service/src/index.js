"use strict";
const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const di = require("./config");
const mediator = new EventEmitter();
const logger = require("./config/logger");
const os = require("os");

logger.info("---- APPLICATION INIT ----");

const handleShutdown = (err) => {
  logger.fatal("Application Stopped", {
    reason: err,
    type: os?.type(),
    cpuUsage: process?.cpuUsage(),
    memoryUsage: process?.memoryUsage(),
    loadAverage: os?.loadavg(),
    uptime: process?.uptime(),
  });
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
process.on("SIGSEGV", handleShutdown);
process.on("SIGILL", handleShutdown);
process.on("SIGABRT", handleShutdown);
process.on("SIGFPE", handleShutdown);

process.on("uncaughtRejection", handleShutdown);
process.on("uncaughtException", handleShutdown);

mediator.on("di.ready", (container) => {
  repository
    .connect(container)
    .then((repo) => {
      container.registerValue({ repo });
      return server.start(container);
    })
    .then((app) => {
      logger.info(
        `Server started succesfully, running on port: ${container.cradle.serverSettings.port}`
      );
      app.on("close", () => {
        container.resolve("repo").disconnect();
      });
    });
});

di.init(mediator);

mediator.emit("init");
