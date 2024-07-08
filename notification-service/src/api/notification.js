"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = ({ repo }, app) => {
  app.post("/notification/sendEmail", (req, res, next) => {
    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
    });

    childLogger.info("Request");

    // ****Temporary
    const { validate } = req.container.cradle;
    res.status(status.OK).json({ msg: "ok" });

    // validate(req.body.payload, "notification")
    //   .then((payload) => {
    //     console.log("Payload", payload);
    //     return repo.sendEmail(payload);
    //   })
    //   .then((ok) => {
    //     console.log("Ok");

    //     res.status(status.OK).json({ msg: "ok" });
    //   })
    //   .catch(next);
  });

  app.post("/notification/sendSMS", (req, res, next) => {
    const { validate } = req.container.cradle;

    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
    });

    childLogger.info("Request");

    validate(req.body.payload, "notification")
      .then((payload) => {
        childLogger.trace(
          {
            values: payload,
          },
          "validation successfull"
        );
        return repo.sendSMS(payload);
      })
      .then((ok) => {
        childLogger.trace(
          {
            values: { ok },
          },
          "sms sent successfully"
        );
        res.status(status.OK).json({ msg: "ok" });
      })
      .catch((err) => {
        childLogger.debug(
          {
            reason: err.message,
            stackTrace: err.stackTrace,
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
            statusCode: res.status,
            user: {
              ip: req.ip,
              userAgent: req.get("User-Agent"),
            },
            performance: {
              responseTime: res.get("X-Response Time"),
            },
          },
          "Error occured"
        );
        next(err);
      });
  });
};
