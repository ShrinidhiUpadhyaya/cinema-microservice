const { MongoClient } = require("mongodb");
const logger = require("./logger");

const getMongoURL = (options) => {
  const url = options.servers.reduce(
    (prev, cur) => prev + cur + ",",
    "mongodb://"
  );

  logger.trace({ url: url }, "getMongoURL");

  return `${url.substr(0, url.length - 1)}/${options.db}`;
};

const getMongoAuthOptions = (options) => {
  const auth = {
    auth: {
      username: options.user,
      password: options.pass,
    },
    authSource: "admin",
  };

  logger.trace({ auth: auth }, "getMongoAuthOptions");

  return auth;
};

const connect = (options, mediator) => {
  mediator.once("boot.ready", async () => {
    const client = await new MongoClient(
      getMongoURL(options),
      getMongoAuthOptions(options)
    );

    logger.info(
      {
        options: options,
        mongoURL: getMongoURL(options),
        mongoAuthOptions: getMongoAuthOptions(options),
      },
      "db.connect"
    );
    client
      .connect()
      .then(() => mediator.emit("db.ready", client.db(process.env.DB)))
      .catch((err) => {
        logger.error(
          {
            reason: err,
          },
          "db.error"
        );
        mediator.emit("db.error", err);
      });
  });
};

module.exports = Object.assign({}, { connect });
