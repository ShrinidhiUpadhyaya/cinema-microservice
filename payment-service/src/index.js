"use strict";
const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const di = require("./config");
const mediator = new EventEmitter();
const logger = require("./config/logger");

const loggerInit = logger.init({
  name: "payment-service",
  description: "a service for payment of cinema tickets",
});

if (loggerInit == 0) {
  mediator.on("di.ready", (container) => {
    repository
      .connect(container)
      .then((repo) => {
        container.registerValue({ repo });
        return server.start(container);
      })
      .then((app) => {
        logger.logger.info(
          `Server started succesfully, running on port: ${container.cradle.serverSettings.port} `
        );
        app.on("close", () => {
          container.resolve("repo").disconnect();
        });
      });
  });

  di.init(mediator);

  mediator.emit("init");
}
