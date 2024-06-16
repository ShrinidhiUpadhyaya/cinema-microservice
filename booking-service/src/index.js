"use strict";
const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const di = require("./config");
const mediator = new EventEmitter();
const logger = require("./config/logger");

logger.init({
  name: "booking-service",
  description: "a service for booking cinema tickets",
});

mediator.on("di.ready", (container) => {
  repository
    .connect(container)
    .then((repo) => {
      console.log("Connected. Starting Server");
      container.registerValue({ repo });
      return server.start(container);
    })
    .then((app) => {
      logger.logger.info(
        `Server started succesfully with filebeat, running on port: ${container.cradle.serverSettings.port} `
      );
      app.on("close", () => {
        container.resolve("repo").disconnect();
      });
    });
});

di.init(mediator);

mediator.emit("init");
