const os = require("os");

const logger = {
  logLevels: ["debug", "log", "info", "warn", "error"],

  logMessage: function (level, message, additionalInfo = {}) {
    const logObject = {
      application: "booking-service",
      system: os.hostname(),
      timestamp: Date.now(),
      level: level,
      message: message,
      ...additionalInfo,
    };

    const logString = JSON.stringify(logObject);

    switch (level) {
      case "error":
        console.error(logString);
        break;
      case "warn":
        console.warn(logString);
        break;
      case "info":
        console.info(logString);
        break;
      case "debug":
        console.debug(logString);
        break;
      case "log":
      default:
        console.log(logString);
    }
  },
};

logger.logLevels.forEach((level) => {
  logger[level] = function (message, additionalInfo = {}) {
    this.logMessage(level, message, additionalInfo);
  };
});

module.exports = logger;
