"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = ({ repo }, app) => {
  app.post("/notification/sendEmail", (req, res, next) => {
    const traceId = req.headers["x-trace-id"];

    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
      traceId: traceId,
    });

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
    const traceId = req.headers["x-trace-id"]; // Retrieve the propagated trace ID

    const payload = req?.body?.payload;

    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
      input: payload,
      traceId: traceId,
    });

    validate(req.body.payload, "notification")
      .then((payload) => {
        logger.debug("validation successfull", { payload: payload });

        return repo.sendSMS(payload);
      })
      .then((ok) => {
        logger.debug("sms sent successfully", {
          values: { ok },
        });
        res.status(status.OK).json({ msg: "ok" });
      })
      .catch((err) => {
        logger.debug("Error occured", {
          reason: err?.message,
          stackTrace: err?.stackTrace,
          method: req?.method,
          api: req?.originalUrl,
          body: req?.body,
          params: req?.params,
          query: req?.query,
          headers: req?.headers,
          statusCode: res?.status,
          user: {
            ip: req?.ip,
            userAgent: req?.get("User-Agent"),
          },
          performance: {
            responseTime: res?.get("X-Response Time"),
          },
        });

        next(err);
      });
  });
};
