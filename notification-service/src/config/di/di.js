const { createContainer, asValue } = require("awilix");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const { getLogger } = require("../logger");
const logger = getLogger();

function initDI({ serverSettings, models, smtpSettings }, mediator) {
  mediator.once("init", () => {
    logger.silly("initDI: init");

    const container = createContainer();

    container.register({
      validate: asValue(models.validate),
      serverSettings: asValue(serverSettings),
      smtpSettings: asValue(smtpSettings),
      nodemailer: asValue(nodemailer),
      smtpTransport: asValue(smtpTransport),
    });

    logger.info("configuration settings", {
      validate: models.validate,
      serverSettings: serverSettings,
      smtpSettings: smtpSettings,
      nodemailer: nodemailer,
      smtpTransport: smtpTransport,
    });

    logger.silly("initDI: emit di.ready");

    mediator.emit("di.ready", container);
  });
}

module.exports.initDI = initDI;
