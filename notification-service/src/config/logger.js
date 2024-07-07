const os = require("os");
const logger = require("pino")({
  level: process.env.LOG_LEVEL || "info",
  base: {
    application: process.env.LOG_APPLICATION || null,
    version: process.env.LOG_VERSION || null,
    environment: process.env.LOG_ENVIRONMENT || null,
    pid: process.pid,
    hostname: os.hostname(),
  },
});

module.exports = logger;
