"use strict";
const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const config = require("./config/");
const mediator = new EventEmitter();

const winston = require("winston");
const transports = require("winston-logstash");

// WinstonTCP => Working
// const Transport = require("winston-tcp");
// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.json(),
//   transports: [new winston.transports.Console()],
// });
// logger.add(
//   new Transport({
//     host: "logstash-service",
//     port: 5044,
//   })
// );

const logger = new winston.Logger({
  transports: [
    new transports.Logstash({
      port: 5044,
      node_name: "movies-service",
      host: "logstash-service",
    }),
  ],
});

console.log("Connecting to movies repository...");

process.on("uncaughtException", (err) => {
  console.error("Unhandled Exception", err);
});

process.on("uncaughtRejection", (err, promise) => {
  console.error("Unhandled Rejection", err);
});

mediator.on("db.ready", (db) => {
  let rep;
  repository
    .connect(db)
    .then((repo) => {
      console.log("Connected. Starting Server");
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
