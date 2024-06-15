const winston = require("winston");

var application = "application";

const wlogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const logger = (req, res, next) => {
  const start = Date.now();

  wlogger.info(`${req.method} ${req.originalUrl}`, {
    category: "Request",
    application: application,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (res.statusCode === 200) {
      wlogger.info(`${req.method} ${req.originalUrl}`, {
        category: "Success",
        application: application,
      });
    }

    wlogger.info(`${req.method} ${req.originalUrl}`, {
      category: "Finish",
      application: application,
    });
  });

  next();
};

const errorLogger = (err, req, res, next) => {
  wlogger.info(`${req.method} ${req.originalUrl}`, {
    category: "Error",
    application: application,
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

const init = (name) => (application = name);

module.exports = {
  logger,
  errorLogger,
  init,
};
