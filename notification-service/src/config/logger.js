const os = require("os");
const pino = require("pino");

const transport = pino.transport({
  target: "pino/file",
  options: {
    destination: "/var/log/notification-service/app.log",
  },
});

transport.on("open", () => {
  console.log("Connection established");
});

const logger = pino(
  {
    level: "trace",
    base: {
      application: process.env.LOG_APPLICATION || null,
      version: process.env.LOG_VERSION || null,
      environment: process.env.LOG_ENVIRONMENT || null,
      pid: process.pid,
      hostname: os.hostname(),
    },
  },
  transport
);

module.exports = logger;
