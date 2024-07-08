"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = ({ repo }, app) => {
  app.post("/payment/makePurchase", (req, res, next) => {
    const { validate } = req.container.cradle;

    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
    });

    childLogger.info("Request");

    validate(req.body.paymentOrder, "payment")
      .then((payment) => {
        childLogger.trace(
          {
            values: payment,
          },
          "validation successfull"
        );
        return repo.registerPurchase(payment);
      })
      .then((paid) => {
        childLogger.trace(
          {
            values: paid,
          },
          "payment sucessfull"
        );

        res.status(status.OK).json({ paid });
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

  app.get("/payment/getPurchaseById/:id", (req, res, next) => {
    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
      params: req.params,
    });

    childLogger.info("Request");

    repo
      .getPurchaseById(req.params.id)
      .then((payment) => {
        childLogger.trace(
          {
            values: payment,
          },
          "send payment"
        );

        res.status(status.OK).json({ payment });
      })
      .catch((err) => {
        childLogger.debug(
          {
            reason: err.message,
            stackTrace: err.stackTrace,
            method: req.method,
            api: req.originalUrl,
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
