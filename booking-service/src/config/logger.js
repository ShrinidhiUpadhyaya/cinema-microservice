const os = require("os");
const pino = require("pino");

const transport = pino.transport({
  target: "pino-socket",
  options: {
    address: "logstash",
    port: 5044,
    mode: "tcp",
  },
});

transport.on("socketError", (err) => {
  console.log("Socket error", err);
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
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);

module.exports = logger;
