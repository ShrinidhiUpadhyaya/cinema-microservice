const { createContainer, asValue } = require("awilix");
const stripe = require("stripe");
const { getLogger } = require("../logger");
const logger = getLogger();

function initDI(
  { serverSettings, dbSettings, database, models, stripeSettings },
  mediator
) {
  mediator.once("init", () => {
    logger.silly("initDI: init");

    mediator.on("db.ready", (db) => {
      logger.silly("initDI: db.ready");

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
      logger.silly("initDI: emit db.error");

      mediator.emit("di.error", err);
    });

    database.connect(dbSettings, mediator);
    logger.silly("initDI: emit boot.ready");
    mediator.emit("boot.ready");
  });
}

module.exports.initDI = initDI;
