const { createContainer, asValue } = require("awilix");
const stripe = require("stripe");
const logger = require("../logger");

function initDI(
  { serverSettings, dbSettings, database, models, stripeSettings },
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
        ObjectID: asValue(database.ObjectID),
        serverSettings: asValue(serverSettings),
        stripe: asValue(stripe(stripeSettings.secret)),
      });

      logger.info("configuration settings", {
        serverSettings: serverSettings,
        dbSettings: dbSettings,
        database: database,
        models: models,
        stripeSettings: stripeSettings,
      });

      mediator.emit("di.ready", container);
    });

    mediator.on("db.error", (err) => {
      logger.log("initDI: emit db.error");

      mediator.emit("di.error", err);
    });

    database.connect(dbSettings, mediator);
    logger.log("initDI: emit boot.ready");
    mediator.emit("boot.ready");
  });
}

module.exports.initDI = initDI;
