const { MongoClient } = require("mongodb");
const { getLogger } = require("../logger");
const logger = getLogger();

const getMongoURL = (options) => {
  const url = options.servers.reduce(
    (prev, cur) => prev + cur + ",",
    "mongodb://"
  );

  return `${url.substr(0, url.length - 1)}/${options.db}`;
};

const getMongoAuthOptions = (options) => {
  return {
    auth: {
      username: options.user,
      password: options.pass,
    },
    authSource: "admin",
  };
};

const connect = (options, mediator) => {
  mediator.once("boot.ready", async () => {
    const client = await new MongoClient(
      getMongoURL(options),
      getMongoAuthOptions(options)
    );

    logger.info("db.connect", {
      values: {
        options: options,
        mongoURL: getMongoURL(options),
        mongoAuthOptions: getMongoAuthOptions(options),
      },
    });
    client
      .connect()
      .then(() => mediator.emit("db.ready", client.db(process.env.DB)))
      .catch((err) => {
        logger.error("db.error", { reason: err });
        mediator.emit("db.error", err);
      });
  });
};

module.exports = Object.assign({}, { connect });
