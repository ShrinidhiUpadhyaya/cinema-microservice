const os = require("os");
const process = require("process");
const winston = require("winston");

const application = {
  name: null,
  description: null,
  metadata: null,
};

const metrics = {
  system: os.hostname(),
  type: os.type(),
  cpuUsage: process.cpuUsage(),
  memoryUsage: process.memoryUsage(),
  loadAverage: os.loadavg(),
  uptime: process.uptime(),
};

const init = (input) => {
  application.name = input?.name;
  application.description = input?.description;
  application.metadata = input?.metadata;

  logStart();
  handleErrorSignals();
};

const wlogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    application: application?.name,
    system: os.hostname(),
  },
  transports: [new winston.transports.Console()],
});

const logStart = () => {
  wlogger.info("Application Start", {
    application: application,
    metrics: metrics,
  });
};

const logShutdown = (signal) => {
  return () => {
    wlogger.info(`Application Shutdown ${signal}`, {
      application: application,
      metrics: metrics,
      reason: signal,
      category: "Shutdown",
    });
  };
};

const logException = (exception) => {
  return () => {
    wlogger.info(`${exception}`, {
      application: application?.name,
      category: "Exception",
    });
  };
};

const logRejection = (rejection) => {
  return () => {
    wlogger.warn(`${rejection}`, {
      application: application?.name,
      category: "Rejection",
    });
  };
};

const logWarning = (warning) => {
  return () => {
    wlogger.info(`${warning.message}`, {
      application: application?.name,
      category: "Warning",
    });
  };
};

const handleErrorSignals = () => {
  const signals = [
    "SIGINT",
    "SIGTERM",
    "SIGSEGV",
    "SIGILL",
    "SIGABRT",
    "SIGFPE",
  ];

  const exceptions = ["uncaughtException"];
  const rejections = ["unhandledRejection"];
  const warnings = ["warning"];

  signals.forEach((signal) => {
    process.on(signal, logShutdown(signal));
  });

  exceptions.forEach((exception) => {
    process.on(exception, logException(exception));
  });

  rejections.forEach((rejection) => {
    process.on(rejection, logRejection(rejection));
  });

  warnings.forEach((warning) => {
    process.on(warning, logWarning(warning));
  });
};

module.exports = { init, wlogger };
