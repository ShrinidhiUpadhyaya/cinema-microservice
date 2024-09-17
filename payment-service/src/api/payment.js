"use strict";
const apm = require("elastic-apm-node").start({
  serviceName: "payment-service",
  secretToken: "",
  apiKey: "",
  serverUrl: "http://apm-server:8200",
  captureBody: "all",
});

const status = require("http-status");

module.exports = ({ repo }, app) => {
  app.post("/payment/makePurchase", (req, res, next) => {
    const transaction = apm.startTransaction("makePurchase", "request");

    const { validate } = req.container.cradle;

    validate(req.body.paymentOrder, "payment")
      .then((payment) => {
        const registerSpan = transaction.startSpan("registerPurchase", "db");
        return repo.registerPurchase(payment).finally(() => {
          registerSpan.end();
        });
      })
      .then((paid) => {
        res.status(status.OK).json({ paid });
      })
      .catch((err) => {
        apm.captureError(err);
        next(err);
      })
      .finally(() => {
        transaction.end();
      });
  });

  app.get("/payment/getPurchaseById/:id", (req, res, next) => {
    const transaction = apm.startTransaction("getPurchaseById", "request");

    repo
      .getPurchaseById(req.params.id)
      .then((payment) => {
        res.status(status.OK).json({ payment });
      })
      .catch((err) => {
        apm.captureError(err);
        next(err);
      })
      .finally(() => {
        transaction.end();
      });
  });
};
