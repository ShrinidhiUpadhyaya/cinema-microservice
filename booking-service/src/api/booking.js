"use strict";
const status = require("http-status");
const logger = require("../config/logger");
const { v4: uuidv4 } = require("uuid");

module.exports = ({ repo }, app) => {
  app.post("/booking", (req, res, next) => {
    const validate = req.container.cradle.validate;
    const paymentService = req.container.resolve("paymentService");
    const notificationService = req.container.resolve("notificationService");
    const traceId = req.headers["x-trace-id"] || uuidv4();
    req.headers["x-trace-id"] = traceId;

    const user = req?.body?.user;
    const booking = req?.body?.booking;

    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
      traceId: traceId,
    });

    Promise.all([validate(user, "user"), validate(booking, "booking")])
      .then(([user, booking]) => {
        // Return Value Logging
        logger.debug("validation successfull", {
          values: { user, booking },
          traceId: traceId,
        });
        const payment = {
          userName: user.name + " " + user.lastName,
          currency: "mxn",
          number: user.creditCard.number,
          cvc: user.creditCard.cvc,
          exp_month: user.creditCard.exp_month,
          exp_year: user.creditCard.exp_year,
          amount: booking.totalAmount,
          description: `
          Tickect(s) for movie ${booking.movie},
          with seat(s) ${booking.seats.toString()}
          at time ${booking.schedule}`,
        };

        return Promise.all([
          paymentService(payment, traceId),
          Promise.resolve(user),
          Promise.resolve(booking),
        ]);
      })
      .then(([paid, user, booking]) => {
        // Return Value Logging
        logger.debug("make booking", { values: { paid, user, booking } });

        return Promise.all([
          repo.makeBooking(user, booking),
          Promise.resolve(paid),
          Promise.resolve(user),
        ]);
      })
      .then(([booking, paid, user]) => {
        // Return Value Logging
        logger.debug("generate ticket", {
          values: { booking, paid, user },
        });

        return Promise.all([
          repo.generateTicket(paid, booking),
          Promise.resolve(user),
        ]);
      })
      .then(([ticket, user]) => {
        // Return Value Logging
        logger.debug("send notification", { values: { ticket, user } });

        const payload = Object.assign({}, ticket, {
          user: { name: user.name + user.lastName, email: user.email },
        });
        notificationService(payload, traceId);
        res.status(status.OK).json(ticket);
      })
      .catch((err) => {
        // Exception Logging, Not all errors should be logged with error
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

  app.get("/booking/verify/:orderId", (req, res, next) => {
    const orderId = req?.params?.orderId;

    const traceId = req.headers["x-trace-id"] || uuidv4();
    req.headers["x-trace-id"] = traceId;

    logger.info("Request", {
      method: req?.method,
      api: "/booking/verify/:orderId",
      input: orderId,
      traceId: traceId,
    });

    repo
      .getOrderById(orderId)
      .then((order) => {
        logger.debug("getOrderById successfull", { values: order });
        res.status(status.OK).json(order);
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
