const expressWinston = require("express-winston");
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const request = expressWinston.logger({
  winstonInstance: logger,
  meta: false,
});

const error = expressWinston.errorLogger({
  winstonInstance: logger,
});

module.exports = {
  request,
  error,
};
