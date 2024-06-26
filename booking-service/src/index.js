"use strict";
require("./config/instrument");

const { EventEmitter } = require("events");
const server = require("./server/server");
const repository = require("./repository/repository");
const di = require("./config");
const mediator = new EventEmitter();

var apm = require("elastic-apm-node").start({
  serviceName: "",
  secretToken: "",
  apiKey: "",
  serverUrl: "http://apm-server:8200",
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
      app.on("close", () => {
        container.resolve("repo").disconnect();
      });
    });
});

di.init(mediator);

mediator.emit("init");
