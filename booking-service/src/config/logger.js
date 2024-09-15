const os = require("os");
const process = require("process");
const winston = require("winston");
require("winston-daily-rotate-file");

let applicationData = {};
let fileRotateTransport;
const logger = { logger: null };

const metrics = {
  system: os.hostname(),
  type: os.type(),
  cpuUsage: process.cpuUsage(),
  memoryUsage: process.memoryUsage(),
  loadAverage: os.loadavg(),
  uptime: process.uptime(),
};

function initApplicationData(values) {
  if (values) {
    applicationData = {
      name: values.name,
      description: values.description,
      metadata: values.metadata,
      level: values.level,
      filename: values.filename,
    };
  }
}

function initLogRotationData(values) {
  if (values?.filename) {
    fileRotateTransport = new winston.transports.DailyRotateFile({ ...values });
  }
}

function getTransport() {
  if (fileRotateTransport) {
    return fileRotateTransport;
  } else if (applicationData?.filename) {
    return new winston.transports.File({
      filename: applicationData.filename,
      level: applicationData.level,
    });
  } else {
    return new winston.transports.Console();
  }
}

function initLogger() {
  logger.logger = winston.createLogger({
    level: applicationData.level ?? "silly",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: {
      application: applicationData.name,
      system: os.hostname(),
    },
    transports: getTransport(),
  });
}

const init = ({ applicationData, logRotationData }) => {
  try {
    initApplicationData(applicationData);
    initLogRotationData(logRotationData);
    initLogger();
    logStart();
    handleErrorSignals();
    return 0;
  } catch (err) {
    console.error("Logger initialization failed:", err);
    return -1;
  }
};

const logStart = () => {
  logger.logger.info("---- APPLICATION INIT ----", {
    application: applicationData?.name,
    description: applicationData?.description,
    metadata: applicationData?.metadata,
    metrics: metrics,
  });
};

const logShutdown = (signal) => {
  logger.logger.error("Application Shutdown", {
    application: applicationData?.name,
    description: applicationData?.description,
    metadata: applicationData?.metadata,
    metrics: metrics,
    reason: signal,
    category: "Shutdown",
  });
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

  signals.forEach((signal) => {
    process.on(signal, () => logShutdown(signal));
  });

  process.on("uncaughtException", (error) => {
    logger.logger.error("Exception", {
      application: applicationData?.name,
      category: "Exception",
      reason: error,
    });
  });

  process.on("unhandledRejection", (reason) => {
    logger.logger.error(`Rejection`, {
      application: applicationData?.name,
      category: "Rejection",
      reason: reason,
    });
  });

  process.on("warning", (warning) => {
    logger.logger.warn(`${warning.name}: ${warning.message}`, {
      application: applicationData?.name,
      category: "Warning",
      stack: warning.stack,
    });
  });
};

const apiLogger = (req, res, next) => {
  const start = Date.now();

  logger.logger.info(`${req.method} ${req.originalUrl}`, {
    category: "Request",
    application: applicationData?.name,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (res.statusCode === 200) {
      logger.logger.info(`${req.method} ${req.originalUrl}`, {
        category: "Success",
        application: applicationData?.name,
      });
    }

    logger.logger.info(`${req.method} ${req.originalUrl}`, {
      category: "Finish",
      application: applicationData?.name,
    });
  });

  next();
};

const apiErrorLogger = (err, req, res, next) => {
  logger.logger.debug(`${req.method} ${req.originalUrl}`, {
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

function getLogger() {
  return logger?.logger;
}

module.exports = {
  init,
  apiLogger,
  apiErrorLogger,
  getLogger,
};
