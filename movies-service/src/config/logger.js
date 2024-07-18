const os = require("os");
const process = require("process");
const winston = require("winston");

const applicationData = {};

const metrics = {
  system: os.hostname(),
  type: os.type(),
  cpuUsage: process.cpuUsage(),
  memoryUsage: process.memoryUsage(),
  loadAverage: os.loadavg(),
  uptime: process.uptime(),
};

const init = (input) => {
  try {
    applicationData.name = input?.name;
    applicationData.description = input?.description;
    applicationData.metadata = input?.metadata;

    logStart();
    handleErrorSignals();
    return 0;
  } catch (err) {
    console.error("Logger initialization failed:", err);
    return -1;
  }
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    application: applicationData.name,
    system: os.hostname(),
  },
  transports: [
    // new winston.transports.Console(),
    new winston.transports.File({
      //path to log file
      filename: "/var/log/movies-service/app.log",
      level: "debug",
    }),
  ],
});

const logStart = () => {
  logger.info("---- APPLICATION INIT ----", {
    application: applicationData?.name,
    description: applicationData?.description,
    metadata: applicationData?.metadata,
    metrics: metrics,
  });
};

const logShutdown = (signal) => {
  return () => {
    logger.error(`Application Shutdown ${signal}`, {
      application: applicationData?.name,
      description: applicationData?.description,
      metadata: applicationData?.metadata,
      metrics: metrics,
      reason: signal,
      category: "Shutdown",
    });
  };
};

const logException = (exception) => {
  return () => {
    logger.error(`${exception}`, {
      application: applicationData?.name,
      category: "Exception",
    });
  };
};

const logRejection = (rejection) => {
  return () => {
    logger.error(`${rejection}`, {
      application: applicationData?.name,
      category: "Rejection",
    });
  };
};

const logWarning = (warning) => {
  return () => {
    logger.error(`${warning.message}`, {
      application: applicationData?.name,
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
    application: applicationData?.name,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (res.statusCode === 200) {
      logger.info(`${req.method} ${req.originalUrl}`, {
        category: "Success",
        application: applicationData?.name,
      });
    }

    logger.info(`${req.method} ${req.originalUrl}`, {
      category: "Finish",
      application: applicationData?.name,
    });
  });

  next();
};

const apiErrorLogger = (err, req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    category: "Error",
    application: applicationData?.name,
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
