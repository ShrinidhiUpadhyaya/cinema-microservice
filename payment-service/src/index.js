"use strict";

const { init } = require("./config/logger");
init({
  applicationData: {
    name: "payment-service",
    filename: "/var/log/payment-service/app.log",
  },
});

const { getLogger } = require("./config/logger");
const logger = getLogger();

const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const di = require("./config");
const mediator = new EventEmitter();

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
