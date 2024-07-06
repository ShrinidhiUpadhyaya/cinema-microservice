const os = require("os");
const logger = require("pino")({
  level: "info",
  base: {
    application: "booking-service",
    version: "v1.0.1",
    environment: "TEST",
    pid: process.pid,
    hostname: os.hostname(),
  },
});

module.exports = logger;
