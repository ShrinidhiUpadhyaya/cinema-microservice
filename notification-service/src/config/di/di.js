const { createContainer, asValue } = require("awilix");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const logger = require("../logger");

function initDI({ serverSettings, models, smtpSettings }, mediator) {
  mediator.once("init", () => {
    const container = createContainer();

    container.register({
      validate: asValue(models.validate),
      serverSettings: asValue(serverSettings),
      smtpSettings: asValue(smtpSettings),
      nodemailer: asValue(nodemailer),
      smtpTransport: asValue(smtpTransport),
    });

    logger.info("configuration settings", {
      serverSettings: serverSettings,
      models: models,
      smtpSettings: smtpSettings,
    });

    mediator.emit("di.ready", container);
  });
}

module.exports.initDI = initDI;
