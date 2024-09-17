"use strict";

const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const di = require("./config");
const mediator = new EventEmitter();

mediator.on("di.ready", (container) => {
  repository
    .connect(container)
    .then((repo) => {
      console.log("Connected. Starting Server");
      container.registerValue({ repo });
      return server.start(container);
    })
    .then((app) => {
      app.on("close", () => {
        container.resolve("repo").disconnect();
      });
    });
});

di.init(mediator);

mediator.emit("init");
