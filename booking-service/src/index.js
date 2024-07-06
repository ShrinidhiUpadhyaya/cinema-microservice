"use strict";
const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const di = require("./config");
const mediator = new EventEmitter();

const now = new Date();
now.setDate(now.getDate() + 1);

mediator.on("di.ready", (container) => {
  repository
    .connect(container)
    .then((repo) => {
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
