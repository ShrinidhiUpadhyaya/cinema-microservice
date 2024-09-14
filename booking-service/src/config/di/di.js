const { createContainer, asValue } = require("awilix");
const logger = require("../logger");

function initDI(
  { serverSettings, dbSettings, database, models, services },
  mediator
) {
  mediator.once("init", () => {
    mediator.on("db.ready", (db) => {
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

      mediator.emit("di.ready", container);
    });

    mediator.on("db.error", (err) => {
      mediator.emit("di.error", err);
    });

    database.connect(dbSettings, mediator);

    mediator.emit("boot.ready");
  });
}

module.exports.initDI = initDI;
