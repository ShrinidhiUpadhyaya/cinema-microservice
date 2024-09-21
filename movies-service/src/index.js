"use strict";
const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const config = require("./config");
const mediator = new EventEmitter();
const logger = require("./config/logger");
const os = require("os");

const getProcessInfo = () => ({
  type: os.type(),
  cpuUsage: process.cpuUsage(),
  memoryUsage: process.memoryUsage(),
  loadAverage: os.loadavg(),
  uptime: process.uptime(),
});

logger.info(
  {
    ...getProcessInfo(),
  },
  "---- APPLICATION INIT ----"
);

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

const signals = ["SIGINT", "SIGTERM", "SIGSEGV", "SIGILL", "SIGABRT", "SIGFPE"];

const handleShutdown = (reason, isError = true) => {
  const processInfo = getProcessInfo();

  if (isError) {
    const errorInfo = serializeError(reason);
    logger.error(
      {
        reason: errorInfo,
        ...processInfo,
      },
      "---- Application Stopped Due to Error ----"
    );
  } else {
    logger.error(
      {
        reason: reason,
        ...processInfo,
      },
      "---- Application Shutdown ----"
    );
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

mediator.on("db.ready", (db) => {
  let rep;
  repository
    .connect(db)
    .then((repo) => {
      rep = repo;

      logger.info(
        {
          port: config?.serverSettings?.port,
          ssl: config?.serverSettings?.ssl,
          dbSettings: config?.dbSettings,
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
        `Server started succesfully, running on port: ${config?.serverSettings?.port} `
      );
      app.on("close", () => {
        rep.disconnect();
      });
    });
});

mediator.on("db.error", (err) => {
  logger.error({ reason: err }, "db.error");
});

config.db.connect(config.dbSettings, mediator);

mediator.emit("boot.ready");
