"use strict";
const status = require("http-status");
const { logger, errorLogger, init } = require("../config/logger");

module.exports = ({ repo }, app) => {
  init("notification-service");
  app.use(logger);

  app.post("/notification/sendEmail", (req, res, next) => {
    console.log("/notification/sendEmail");

    // ****Temporary
    const { validate } = req.container.cradle;
    res.status(status.OK).json({ msg: "ok" });

    // validate(req.body.payload, "notification")
    //   .then((payload) => {
    //     console.log("Payload", payload);
    //     return repo.sendEmail(payload);
    //   })
    //   .then((ok) => {
    //     console.log("Ok");

    //     res.status(status.OK).json({ msg: "ok" });
    //   })
    //   .catch(next);
  });

  app.post("/notification/sendSMS", (req, res, next) => {
    const { validate } = req.container.cradle;

    validate(req.body.payload, "notification")
      .then((payload) => {
        return repo.sendSMS(payload);
      })
      .then((ok) => {
        res.status(status.OK).json({ msg: "ok" });
      })
      .catch(next);
  });

  app.use(errorLogger);
};
