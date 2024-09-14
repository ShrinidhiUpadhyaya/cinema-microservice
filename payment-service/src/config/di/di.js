const { createContainer, asValue } = require("awilix");
const stripe = require("stripe");
const logger = require("../logger");

function initDI(
  { serverSettings, dbSettings, database, models, stripeSettings },
  mediator
) {
  mediator.once("init", () => {
    mediator.on("db.ready", (db) => {
      const container = createContainer();

      container.register({
        database: asValue(db),
        validate: asValue(models.validate),
        ObjectID: asValue(database.ObjectID),
        serverSettings: asValue(serverSettings),
        stripe: asValue(stripe(stripeSettings.secret)),
      });

      mediator.emit("di.ready", container);

      logger.info("configuration settings", {
        serverSettings: serverSettings,
        dbSettings: dbSettings,
        database: database,
        models: models,
        stripeSettings: stripeSettings,
      });
    });

    mediator.on("db.error", (err) => {
      logger.error("di.error", {
        reason: err,
      });
      mediator.emit("di.error", err);
    });

    database.connect(dbSettings, mediator);

    mediator.emit("boot.ready");
  });
}

module.exports.initDI = initDI;
