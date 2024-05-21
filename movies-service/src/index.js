"use strict";
const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const config = require("./config/");
const mediator = new EventEmitter();
const logger = require("./utils/logger");

console.log("Connecting to movies repository...");
logger.info("Connecting to movies repository...");

process.on("uncaughtException", (err) => {
  console.error("Unhandled Exception", err);
  logger.info("Unhandled Exception", err);
});

process.on("uncaughtRejection", (err, promise) => {
  console.error("Unhandled Rejection", err);
  logger.info("Unhandled Rejection", err);
});

mediator.on("db.ready", (db) => {
  let rep;
  repository
    .connect(db)
    .then((repo) => {
      console.log("Connected. Starting Server");
      logger.info("Connected. Starting Server");

      rep = repo;
      return server.start({
        port: config.serverSettings.port,
        ssl: config.serverSettings.ssl,
        repo,
      });
    })
    .then((app) => {
      console.log(
        `Server started succesfully, running on port: ${config.serverSettings.port}.`
      );
      logger.info(
        `Server started succesfully, running on port: ${config.serverSettings.port}.`
      );
      app.on("close", () => {
        rep.disconnect();
      });
    });
});

mediator.on("db.error", (err) => {
  console.error(err);
  logger.info(err);
});

config.db.connect(config.dbSettings, mediator);

mediator.emit("boot.ready");
