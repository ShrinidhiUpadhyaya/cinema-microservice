"use strict";

const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const di = require("./config");
const mediator = new EventEmitter();

const os = require("os");

const now = new Date();
now.setDate(now.getDate() + 1);

console.info({
  application: "booking-service",
  system: os.hostname(),
  message: "---- APPLICATION INIT ----",
  timestamp: Date.now(),
  level: "info",
});

const handleShutdown = (err) => {
  console.error({
    application: "booking-service",
    system: os.hostname(),
    message: "---- Application Stopped ----",
    timestamp: Date.now(),
    level: "error",
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
      console.info({
        application: "booking-service",
        system: os.hostname(),
        message: "Server started succesfully, running on port:",
        timestamp: Date.now(),
        level: "info",
        port: container.cradle.serverSettings.port,
      });
      app.on("close", () => {
        container.resolve("repo").disconnect();
      });
    });
});

di.init(mediator);

mediator.emit("init");
