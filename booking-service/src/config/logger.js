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

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    application: application?.name,
    system: os.hostname(),
  },
  transports: [
    // new winston.transports.Console(),
    new winston.transports.File({
      //path to log file
      filename: "/var/log/app.log",
      level: "debug",
    }),
  ],
});

const logStart = () => {
  logger.info("Application Start", {
    application: application,
    metrics: metrics,
  });
};

const logShutdown = (signal) => {
  return () => {
    logger.info(`Application Shutdown ${signal}`, {
      application: application,
      metrics: metrics,
      reason: signal,
      category: "Shutdown",
    });
  };
};

const logException = (exception) => {
  return () => {
    logger.info(`${exception}`, {
      application: application?.name,
      category: "Exception",
    });
  };
};

const logRejection = (rejection) => {
  return () => {
    logger.warn(`${rejection}`, {
      application: application?.name,
      category: "Rejection",
    });
  };
};

const logWarning = (warning) => {
  return () => {
    logger.info(`${warning.message}`, {
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

const apiLogger = (req, res, next) => {
  const start = Date.now();

  logger.info(`${req.method} ${req.originalUrl}`, {
    category: "Request",
    application: application?.name,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (res.statusCode === 200) {
      logger.info(`${req.method} ${req.originalUrl}`, {
        category: "Success",
        application: application?.name,
      });
    }

    logger.info(`${req.method} ${req.originalUrl}`, {
      category: "Finish",
      application: application?.name,
    });
  });

  next();
};

const apiErrorLogger = (err, req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    category: "Error",
    application: application?.name,
    reason: err.message,
    user: {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
    input: {
      params: req.params,
      query: req.query,
      body: req.body,
    },
    performance: {
      responseTime: res.get("X-Response Time"),
    },
  });
  next(err);
};

module.exports = { init, logger, apiLogger, apiErrorLogger };
