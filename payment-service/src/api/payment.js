"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = ({ repo }, app) => {
  app.post("/payment/makePurchase", (req, res, next) => {
    const { validate } = req.container.cradle;
    const traceId = req.headers["x-trace-id"];

    const paymentOrder = req?.body?.paymentOrder;

    logger.info(
      {
        method: req?.method,
        api: req?.originalUrl,
        input: paymentOrder,
        traceId: traceId,
      },
      "Request"
    );
    validate(paymentOrder, "payment")
      .then((payment) => {
        logger.debug(
          {
            payment: payment,
            traceId: traceId,
          },
          "validation successfull"
        );
        return repo.registerPurchase(payment);
      })
      .then((paid) => {
        logger.debug(
          {
            paid: paid,
            traceId: traceId,
          },
          "payment successfull"
        );

        res.status(status.OK).json({ paid });
      })
      .catch((err) => {
        logger.debug(
          {
            reason: err?.message,
            stackTrace: err?.stackTrace,
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
            traceId: traceId,
          },
          "Error occured"
        );
        next(err);
      });
  });

  app.get("/payment/getPurchaseById/:id", (req, res, next) => {
    const id = req?.params?.id;
    const traceId = req.headers["x-trace-id"]; // Retrieve the propagated trace ID

    logger.info(
      {
        method: req?.method,
        api: req?.originalUrl,
        input: id,
        traceId: traceId,
      },
      "Request"
    );

    repo
      .getPurchaseById(id)
      .then((payment) => {
        logger.debug(
          {
            payment: payment,
            traceId: traceId,
          },
          "send payment"
        );

        res.status(status.OK).json({ payment });
      })
      .catch((err) => {
        logger.debug(
          {
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
            traceId: traceId,
          },
          "Error occured"
        );
        next(err);
      });
  });
};
