const { createContainer, asValue } = require("awilix");
const stripe = require("stripe");
const logger = require("../logger");

function initDI(
  { serverSettings, dbSettings, database, models, stripeSettings },
  mediator
) {
  mediator.once("init", () => {
    logger.trace("initDI: init");

    mediator.on("db.ready", (db) => {
      logger.trace("initDI: db.ready");

      const container = createContainer();

      container.register({
        database: asValue(db),
        validate: asValue(models.validate),
        ObjectID: asValue(database.ObjectID),
        serverSettings: asValue(serverSettings),
        stripe: asValue(stripe(stripeSettings.secret)),
      });

      mediator.emit("di.ready", container);

      logger.info(
        {
          serverSettings: serverSettings,
          dbSettings: dbSettings,
          database: database,
          models: models,
          stripeSettings: stripeSettings,
        },
        "configuration settings"
      );
    });

    mediator.on("db.error", (err) => {
      logger.trace("initDI: emit db.error");

      mediator.emit("di.error", err);
    });

    database.connect(dbSettings, mediator);

    logger.trace("initDI: emit boot.ready");

    mediator.emit("boot.ready");
  });
}

module.exports.initDI = initDI;
