const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;
const os = require("os");

const customFormat = printf(
  ({
    level,
    message,
    label,
    timestamp,
    session,
    systemName,
    systemConfig,
    ...props
  }) => {
    let logMessage = {
      timestamp,
      level,
      label,
      message,
      ...props,
    };

    if (level === "info") {
      logMessage.session = session;
      logMessage.systemName = os.hostname();
    }

    if (level === "fatal") {
      logMessage.systemConfig = {
        cpuUsage: os.loadavg(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        uptime: os.uptime(),
      };
    }

    return JSON.stringify(logMessage);
  }
);

const logger = (application) => {
  return createLogger({
    format: combine(label({ label: application }), timestamp(), customFormat),
    transports: [new transports.Console()],
  });
};

module.exports = logger;
