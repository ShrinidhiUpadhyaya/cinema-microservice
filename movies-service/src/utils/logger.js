const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  //   transports: [new winston.transports.Console()],

  transports: [
    new winston.transports.File({
      //path to log file
      filename: "/var/log/app.log",
      level: "debug",
    }),
  ],
});

// logger.add(
//   new Transport({
//     host: "logstash-service",
//     port: 5044,
//   })
// );

module.exports = logger;
