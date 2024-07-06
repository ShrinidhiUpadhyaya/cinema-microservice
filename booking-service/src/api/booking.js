"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = ({ repo }, app) => {
  app.post("/booking", (req, res, next) => {
    const validate = req.container.cradle.validate;
    const paymentService = req.container.resolve("paymentService");
    const notificationService = req.container.resolve("notificationService");

    // make use of child logger
    const childLogger = logger.child({
      method: req.method,
      api: "/booking",
      params: req.body,
    });

    childLogger.info("Request");

    Promise.all([
      validate(req.body.user, "user"),
      validate(req.body.booking, "booking"),
    ])
      .then(([user, booking]) => {
        // Return Value Logging
        childLogger.trace("validation successfull", {
          values: { user, booking },
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
          paymentService(payment),
          Promise.resolve(user),
          Promise.resolve(booking),
        ]);
      })
      .then(([paid, user, booking]) => {
        // Return Value Logging
        childLogger.trace("make booking", { values: { paid, user, booking } });

        return Promise.all([
          repo.makeBooking(user, booking),
          Promise.resolve(paid),
          Promise.resolve(user),
        ]);
      })
      .then(([booking, paid, user]) => {
        // Return Value Logging
        childLogger.trace("generate ticket", {
          values: { booking, paid, user },
        });

        return Promise.all([
          repo.generateTicket(paid, booking),
          Promise.resolve(user),
        ]);
      })
      .then(([ticket, user]) => {
        // Return Value Logging
        childLogger.trace("send notification", { values: { ticket, user } });

        const payload = Object.assign({}, ticket, {
          user: { name: user.name + user.lastName, email: user.email },
        });
        notificationService(payload);
        res.status(status.OK).json(ticket);
      })
      .catch((err) => {
        // Exception Logging, Not all errors should be logged with error
        childLogger.debug({
          msg: "Error occured",
          reason: err.message,
          stackTrace: err.stackTrace,
          method: req.method,
          api: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query,
          user: {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          },
          performance: {
            responseTime: res.get("X-Response Time"),
          },
        });
        next(err);
      });
  });

  app.get("/booking/verify/:orderId", (req, res, next) => {
    const childLogger = logger.child({
      method: req.method,
      api: "/booking/verify/:orderId",
      params: req.params,
      headers: req.headers,
    });

    childLogger.info("Request");

    repo
      .getOrderById(req.params.orderId)
      .then((order) => {
        childLogger.trace(status.OK, order);
        res.status(status.OK).json(order);
      })
      .catch((err) => {
        childLogger.debug("Error occured", {
          reason: err.message,
          stackTrace: err.stackTrace,
          method: req.method,
          api: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query,
          user: {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          },
          performance: {
            responseTime: res.get("X-Response Time"),
          },
        });
        next(err);
      });
  });
};
