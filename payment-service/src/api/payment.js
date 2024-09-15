"use strict";
const status = require("http-status");
const { apiLogger, apiErrorLogger } = require("../config/logger");

module.exports = ({ repo }, app) => {
  app.use(apiLogger);

  app.post("/payment/makePurchase", (req, res, next) => {
    const { validate } = req.container.cradle;

    validate(req.body.paymentOrder, "payment")
      .then((payment) => {
        logger.debug("validation successfull", {
          payment: payment,
        });
        return repo.registerPurchase(payment);
      })
      .then((paid) => {
        res.status(status.OK).json({ paid });
      })
      .catch(next);
  });

  app.get("/payment/getPurchaseById/:id", (req, res, next) => {
    repo
      .getPurchaseById(req.params.id)
      .then((payment) => {
        logger.debug("send payment", {
          payment: payment,
        });
        res.status(status.OK).json({ payment });
      })
      .catch(next);
  });

  app.use(apiErrorLogger);
};
