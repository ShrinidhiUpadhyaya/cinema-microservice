const { createContainer, asValue } = require("awilix");
const logger = require("../logger");

function initDI(
  { serverSettings, dbSettings, database, models, services },
  mediator
) {
  mediator.once("init", () => {
    logger.log("initDI: init");

    mediator.on("db.ready", (db) => {
      logger.log("initDI: db.ready");

      const container = createContainer();

      container.register({
        database: asValue(db),
        validate: asValue(models.validate),
        booking: asValue(models.booking),
        user: asValue(models.user),
        ticket: asValue(models.ticket),
        ObjectID: asValue(database.ObjectID),
        serverSettings: asValue(serverSettings),
        paymentService: asValue(services.paymentService),
        notificationService: asValue(services.notificationService),
      });

      logger.info("configuration settings", {
        serverSettings: serverSettings,
        dbSettings: dbSettings,
        database: database,
        models: models,
        services: services,
      });

      logger.log("initDI: emit di.ready");

      mediator.emit("di.ready", container);
    });

    mediator.on("db.error", (err) => {
      logger.log("initDI: emit db.error", {
        reason: err,
      });

      mediator.emit("di.error", err);
    });

    database.connect(dbSettings, mediator);
    logger.log("initDI: emit boot.ready");

    mediator.emit("boot.ready");
  });
}

module.exports.initDI = initDI;
