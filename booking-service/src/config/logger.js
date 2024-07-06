const os = require("os");
const logger = require("pino")({
  level: "debug",
  base: {
    application: "booking-service",
    environment: "TEST",
    pid: process.pid,
    hostname: os.hostname(),
  },
});

module.exports = logger;
