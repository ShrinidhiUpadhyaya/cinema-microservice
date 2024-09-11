const { MongoClient } = require("mongodb");
const os = require("os");

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

    console.info({
      application: "booking-service",
      system: os.hostname(),
      message: "db.connect",
      timestamp: Date.now(),
      level: "info",
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
        console.error({
          application: "booking-service",
          system: os.hostname(),
          message: "db.error",
          timestamp: Date.now(),
          level: "error",
          reason: err,
        });
        mediator.emit("db.error", err);
      });
  });
};

module.exports = Object.assign({}, { connect });
