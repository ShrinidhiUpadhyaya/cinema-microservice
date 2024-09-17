const status = require("http-status");
const apm = require("elastic-apm-node").start({
  serviceName: "booking-service",
  secretToken: "",
  apiKey: "",
  serverUrl: "http://apm-server:8200",
  captureBody: "all",
});

module.exports = ({ repo }, app) => {
  app.post("/booking", (req, res, next) => {
    const transaction = apm.startTransaction("booking", "request");

    const validate = req.container.cradle.validate;
    const paymentService = req.container.resolve("paymentService");
    const notificationService = req.container.resolve("notificationService");

    Promise.all([
      validate(req.body.user, "user"),
      validate(req.body.booking, "booking"),
    ])
      .then(([user, booking]) => {
        const paymentSpan = transaction.startSpan("paymentService", "external");

        const payment = {
          userName: `${user.name} ${user.lastName}`,
          currency: "mxn",
          number: user.creditCard.number,
          cvc: user.creditCard.cvc,
          exp_month: user.creditCard.exp_month,
          exp_year: user.creditCard.exp_year,
          amount: booking.totalAmount,
          description: `Ticket(s) for movie ${
            booking.movie
          }, with seat(s) ${booking.seats.toString()} at time ${
            booking.schedule
          }`,
        };

        return Promise.all([
          paymentService(payment).finally(() => paymentSpan.end()),
          Promise.resolve(user),
          Promise.resolve(booking),
        ]);
      })
      .then(([paid, user, booking]) => {
        const bookingSpan = transaction.startSpan("makeBooking", "db");

        return Promise.all([
          repo.makeBooking(user, booking).finally(() => bookingSpan.end()),
          Promise.resolve(paid),
          Promise.resolve(user),
        ]);
      })
      .then(([booking, paid, user]) => {
        const ticketSpan = transaction.startSpan("generateTicket", "db");

        return Promise.all([
          repo.generateTicket(paid, booking).finally(() => ticketSpan.end()),
          Promise.resolve(user),
        ]);
      })
      .then(([ticket, user]) => {
        const notificationSpan = transaction.startSpan(
          "notificationService",
          "external"
        );

        const payload = Object.assign({}, ticket, {
          user: { name: user.name + user.lastName, email: user.email },
        });
        return Promise.all([
          notificationService(payload).finally(() => notificationSpan.end()),
          Promise.resolve(ticket),
        ]);
      })
      .then(([_, ticket]) => {
        res.status(status.OK).json(ticket);
      })
      .catch((err) => {
        apm.captureError(err);
        next(err);
      })
      .finally(() => {
        if (transaction) transaction.end();
      });
  });

  app.get("/booking/verify/:orderId", (req, res, next) => {
    const transaction = apm.startTransaction("verifyOrder", "request");

    repo
      .getOrderById(req.params.orderId)
      .then((order) => {
        res.status(status.OK).json(order);
      })
      .catch((err) => {
        apm.captureError(err);
        next(err);
      })
      .finally(() => {
        if (transaction) transaction.end();
      });
  });
};
