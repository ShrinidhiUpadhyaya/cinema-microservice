"use strict";
const apm = require("elastic-apm-node").start({
  serviceName: "notification-service",
  secretToken: "",
  apiKey: "",
  serverUrl: "http://apm-server:8200",
  captureBody: "all",
});

const status = require("http-status");

module.exports = ({ repo }, app) => {
  app.post("/notification/sendEmail", (req, res, next) => {
    const transaction = apm.startTransaction("sendEmail", "notification");

    // ****Temporary Response
    const { validate } = req.container.cradle;
    res.status(status.OK).json({ msg: "ok" });

    // Uncomment when ready to integrate the real functionality:
    // validate(req.body.payload, "notification")
    //   .then((payload) => {
    //     const validationSpan = transaction.startSpan("validatePayload", "validation");
    //     validationSpan.end();
    //     console.log("Payload", payload);
    //     const sendEmailSpan = transaction.startSpan("sendEmail", "email");
    //     return repo.sendEmail(payload).finally(() => sendEmailSpan.end());
    //   })
    //   .then((ok) => {
    //     console.log("Ok");
    //     res.status(status.OK).json({ msg: "ok" });
    //   })
    //   .catch((err) => {
    //     apm.captureError(err); // Capture any errors in APM
    //     next(err);
    //   })
    //   .finally(() => {
    //     if (transaction) transaction.end(); // End transaction
    //   });
  });

  app.post("/notification/sendSMS", (req, res, next) => {
    const transaction = apm.startTransaction("sendSMS", "notification");

    const { validate } = req.container.cradle;

    validate(req.body.payload, "notification")
      .then((payload) => {
        const validationSpan = transaction.startSpan(
          "validatePayload",
          "validation"
        );
        validationSpan.end();
        const sendSMSSpan = transaction.startSpan("sendSMS", "sms");
        return repo.sendSMS(payload).finally(() => sendSMSSpan.end());
      })
      .then((ok) => {
        res.status(status.OK).json({ msg: "ok" });
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
