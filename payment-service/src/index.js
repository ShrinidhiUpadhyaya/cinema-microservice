"use strict";

const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const di = require("./config");
const mediator = new EventEmitter();
const os = require("os");
const logger = require("./config/logger");

logger.info("---- APPLICATION INIT ----");

const serializeError = (err) => {
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      stack: err.stack,
      ...err,
    };
  }
  return err;
};

const getProcessInfo = () => ({
  type: os.type(),
  cpuUsage: process.cpuUsage(),
  memoryUsage: process.memoryUsage(),
  loadAverage: os.loadavg(),
  uptime: process.uptime(),
});

const signals = ["SIGINT", "SIGTERM", "SIGSEGV", "SIGILL", "SIGABRT", "SIGFPE"];

const handleShutdown = (reason, isError = true) => {
  const processInfo = getProcessInfo();

  if (isError) {
    const errorInfo = serializeError(reason);
    logger.error("---- Application Stopped Due to Error ----", {
      reason: errorInfo,
      ...processInfo,
    });
  } else {
    logger.info("---- Application Shutdown ----", {
      reason: reason,
      ...processInfo,
    });
  }
  process.exit(isError ? 1 : 0);
};

process.on("uncaughtException", (error) => {
  handleShutdown(error, true);
});

process.on("unhandledRejection", (reason) => {
  handleShutdown(reason, true);
});

signals.forEach((signal) => {
  process.on(signal, () => {
    handleShutdown(`Received ${signal} signal`, false);
  });
});

mediator.on("di.ready", (container) => {
  repository
    .connect(container)
    .then((repo) => {
      container.registerValue({ repo });
      return server.start(container);
    })
    .then((app) => {
      logger.info(
        `Server started succesfully, running on port: ${container.cradle.serverSettings.port} `
      );
      app.on("close", () => {
        container.resolve("repo").disconnect();
      });
    });
});

di.init(mediator);

mediator.emit("init");
