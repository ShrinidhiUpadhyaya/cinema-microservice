"use strict";
const status = require("http-status");
const os = require("os");
const logger = require("../config/logger");
const { v4: uuidv4 } = require("uuid");

module.exports = ({ repo }, app) => {
  app.post("/booking", (req, res, next) => {
    const validate = req.container.cradle.validate;
    const paymentService = req.container.resolve("paymentService");
    const notificationService = req.container.resolve("notificationService");
    const traceId = req.headers["x-trace-id"] || uuidv4();
    req.headers["x-trace-id"] = traceId;

    logger.info("Request", {
      method: req?.method,
      api: req?.originalUrl,
      traceId: traceId,
    });

    Promise.all([
      validate(req.body.user, "user"),
      validate(req.body.booking, "booking"),
    ])
      .then(([user, booking]) => {
        logger.debug("validation successful", {
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
        logger.debug("make booking", {
          paid: paid,
          user: user,
          booking: booking,
        });

        return Promise.all([
          repo.makeBooking(user, booking),
          Promise.resolve(paid),
          Promise.resolve(user),
        ]);
      })
      .then(([booking, paid, user]) => {
        logger.debug("generate ticket", {
          booking: booking,
          paid: paid,
          user: user,
        });
        return Promise.all([
          repo.generateTicket(paid, booking),
          Promise.resolve(user),
        ]);
      })
      .then(([ticket, user]) => {
        logger.debug("send notification", {
          ticket: ticket,
          user: user,
        });

        const payload = Object.assign({}, ticket, {
          user: { name: user.name + user.lastName, email: user.email },
        });
        notificationService(payload);
        res.status(status.OK).json(ticket);
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

  app.get("/booking/verify/:orderId", (req, res, next) => {
    logger.info("Request", {
      method: req?.method,
      api: "/booking/verify/:orderId",
      input: orderId,
      traceId: traceId,
    });

    repo
      .getOrderById(req.params.orderId)
      .then((order) => {
        logger.debug("getOrderById successfull", {
          order: order,
        });
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
