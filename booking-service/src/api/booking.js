"use strict";
const status = require("http-status");
const os = require("os");

module.exports = ({ repo }, app) => {
  app.post("/booking", (req, res, next) => {
    const validate = req.container.cradle.validate;
    const paymentService = req.container.resolve("paymentService");
    const notificationService = req.container.resolve("notificationService");

    Promise.all([
      validate(req.body.user, "user"),
      validate(req.body.booking, "booking"),
    ])
      .then(([user, booking]) => {
        console.log({
          application: "booking-service",
          system: os.hostname(),
          message: "validation successfull",
          timestamp: Date.now(),
          level: "log",
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
        console.log({
          application: "booking-service",
          system: os.hostname(),
          message: "make booking",
          timestamp: Date.now(),
          level: "log",
          values: { paid, user, booking },
        });

        return Promise.all([
          repo.makeBooking(user, booking),
          Promise.resolve(paid),
          Promise.resolve(user),
        ]);
      })
      .then(([booking, paid, user]) => {
        console.log({
          application: "booking-service",
          system: os.hostname(),
          message: "generate ticket",
          timestamp: Date.now(),
          level: "log",
          values: { booking, paid, user },
        });
        return Promise.all([
          repo.generateTicket(paid, booking),
          Promise.resolve(user),
        ]);
      })
      .then(([ticket, user]) => {
        console.log({
          application: "booking-service",
          system: os.hostname(),
          message: "send notification",
          timestamp: Date.now(),
          level: "log",
          values: { ticket, user },
        });

        const payload = Object.assign({}, ticket, {
          user: { name: user.name + user.lastName, email: user.email },
        });
        notificationService(payload);
        res.status(status.OK).json(ticket);
      })
      .catch((err) => {
        console.error({
          application: "booking-service",
          system: os.hostname(),
          message: "Error occured",
          timestamp: Date.now(),
          level: "error",
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
    repo
      .getOrderById(req.params.orderId)
      .then((order) => {
        console.log({
          application: "booking-service",
          system: os.hostname(),
          message: "getOrderById successfull",
          timestamp: Date.now(),
          level: "log",
          values: order,
        });
        res.status(status.OK).json(order);
      })
      .catch((err) => {
        console.error({
          application: "booking-service",
          system: os.hostname(),
          message: "Error occured",
          timestamp: Date.now(),
          level: "error",
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
