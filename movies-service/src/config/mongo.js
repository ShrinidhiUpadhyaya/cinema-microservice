const { MongoClient } = require("mongodb");

const getMongoURL = (options) => {
  const url = options.servers.reduce(
    (prev, cur) => prev + cur + ",",
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@`
  );

  return `mongodb://${process.env.DB_SERVERS}`;
};

const connect = (options, mediator) => {
  mediator.once("boot.ready", async () => {
    const client = await new MongoClient(getMongoURL(options));
    client
      .connect()
      .then(() => mediator.emit("db.ready", client.db(process.env.DB)))
      .catch((err) => mediator.emit("db.error", err));
  });
};

module.exports = Object.assign({}, { connect });
