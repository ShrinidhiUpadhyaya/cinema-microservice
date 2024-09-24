const os = require("os");
const process = require("process");
const winston = require("winston");
const networkInterfaces = os.networkInterfaces();

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

    fileRotateTransport?.on("error", (error) => {
      logger.logger.warn("logFileRotation: Error", {
        application: applicationData?.name,
        reason: error,
      });
    });

    fileRotateTransport?.on("new", (logFilename) => {
      logger.logger.warn("logFileRotation: New", {
        application: applicationData?.name,
        filename: logFilename,
      });
    });

    fileRotateTransport?.on("rotate", (oldFilename, newFilename) => {
      logger.logger.warn("logFileRotation: Rotate", {
        application: applicationData?.name,
        oldFilename: oldFilename,
        newFilename: newFilename,
      });
    });

    fileRotateTransport?.on("archive", (zipLogFilename) => {
      logger.logger.warn("logFileRotation: Archive", {
        application: applicationData?.name,
        zipLogFilename: zipLogFilename,
      });
    });

    fileRotateTransport?.on("logRemoved", (removedLogFilename) => {
      logger.logger.warn("logFileRotation: LogRemoved", {
        application: applicationData?.name,
        removedLogFilename: removedLogFilename,
      });
    });
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

function getLocalIpAddress() {
  for (const interfaceDetails of Object.values(networkInterfaces)) {
    for (const details of interfaceDetails) {
      if (details.family === "IPv4" && !details.internal) {
        return details.address;
      }
    }
  }
  return "127.0.0.1";
}

function initLogger() {
  const ipAddress = getLocalIpAddress();

  logger.logger = winston.createLogger({
    level: applicationData.level ?? "silly",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: {
      application: applicationData.name,
      system: os.hostname(),
      client_ip: ipAddress,
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

const serializeError = (err) => {
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      stack: err.stack,
      ...err,
    };
  }
  return err;
};

const signals = ["SIGINT", "SIGTERM", "SIGSEGV", "SIGILL", "SIGABRT", "SIGFPE"];

const handleShutdown = (reason, isError = true) => {
  if (isError) {
    const errorInfo = serializeError(reason);
    logger.logger.error(
      {
        reason: errorInfo,
        metrics: metrics,
      },
      "---- Application Stopped Due to Error ----"
    );
  } else {
    logger.logger.error(
      {
        reason: reason,
        metrics: metrics,
      },
      "---- Application Shutdown ----"
    );
  }
  process.exit(isError ? 1 : 0);
};

process.on("uncaughtException", (error) => {
  handleShutdown(error, true);
});

process.on("unhandledRejection", (reason) => {
  handleShutdown(reason, true);
});

process.on("warning", (warning) => {
  logger.logger.warn(`${warning.name}: ${warning.message}`, {
    application: applicationData?.name,
    category: "Warning",
    stack: warning.stack,
  });
});

signals.forEach((signal) => {
  process.on(signal, () => {
    handleShutdown(`Received ${signal} signal`, false);
  });
});

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
