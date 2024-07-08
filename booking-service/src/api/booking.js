"use strict";
const status = require("http-status");
const logger = require("../config/logger");

module.exports = ({ repo }, app) => {
  app.post("/booking", (req, res, next) => {
    const validate = req.container.cradle.validate;
    const paymentService = req.container.resolve("paymentService");
    const notificationService = req.container.resolve("notificationService");

    const user = req.body.user;
    const booking = req.body.booking;

    // make use of child logger
    const childLogger = logger.child({
      method: req.method,
      api: req.originalUrl,
    });

    childLogger.info("Request");

    Promise.all([validate(user, "user"), validate(booking, "booking")])
      .then(([user, booking]) => {
        // Return Value Logging
        childLogger.trace(
          {
            values: { user, booking },
          },
          "validation successfull"
        );
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
        childLogger.trace({ values: { paid, user, booking } }, "make booking");

        return Promise.all([
          repo.makeBooking(user, booking),
          Promise.resolve(paid),
          Promise.resolve(user),
        ]);
      })
      .then(([booking, paid, user]) => {
        // Return Value Logging
        childLogger.trace(
          {
            values: { booking, paid, user },
          },
          "generate ticket"
        );

        return Promise.all([
          repo.generateTicket(paid, booking),
          Promise.resolve(user),
        ]);
      })
      .then(([ticket, user]) => {
        // Return Value Logging
        childLogger.trace({ values: { ticket, user } }, "send notification");

        const payload = Object.assign({}, ticket, {
          user: { name: user.name + user.lastName, email: user.email },
        });
        notificationService(payload);
        res.status(status.OK).json(ticket);
      })
      .catch((err) => {
        // Exception Logging, Not all errors should be logged with error
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

  app.get("/booking/verify/:orderId", (req, res, next) => {
    const orderId = req.params.orderId;

    const childLogger = logger.child({
      method: req.method,
      api: "/booking/verify/:orderId",
      input: orderId,
    });

    childLogger.info("Request");

    repo
      .getOrderById(orderId)
      .then((order) => {
        childLogger.trace({ values: order }, "getOrderById successfull");
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
          headers: req.headers,
          statusCode: res.status,

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

  // app.use((err, req, res, next) => {
  //   logger.debug("Error occured", {
  //     reason: err.message,
  //     stackTrace: err.stackTrace,
  //     method: req.method,
  //     api: req.originalUrl,
  //     body: req.body,
  //     params: req.params,
  //     query: req.query,
  //     user: {
  //       ip: req.ip,
  //       userAgent: req.get("User-Agent"),
  //     },
  //     performance: {
  //       responseTime: res.get("X-Response Time"),
  //     },
  //   });

  //   res
  //     .status(status.INTERNAL_SERVER_ERROR)
  //     .json({ error: "Internal Server Error" });
  // });
};
