"use strict";
const logger = require("../config/logger");

const repository = (container) => {
  const { database: db } = container.cradle;

  const makePurchase = (payment) => {
    return new Promise(async (resolve, reject) => {
      const { stripe } = container.cradle;
      try {
        const charge = await stripe.paymentIntents.create({
          amount: Math.ceil(payment.amount * 100),
          currency: payment.currency,
        });

        const paid = Object.assign(
          {},
          { user: payment.userName, amount: payment.amount, charge }
        );

        logger.debug({ paid: paid }, "makePurchase");

        resolve(paid);
      } catch (err) {
        reject(
          new Error(
            "An error occuered procesing payment with stripe, err: " + err
          )
        );
      }
    });
  };

  const registerPurchase = (payment) => {
    return new Promise((resolve, reject) => {
      makePurchase(payment)
        .then((paid) => {
          try {
            db.collection("payments").insertOne(paid);

            logger.debug({ paid: paid }, "registerPurchase");

            resolve(paid);
          } catch {
            reject(
              new Error(
                "an error occuered registring payment at db, err:" + err
              )
            );
          }
        })
        .catch((err) => reject(err));
    });
  };

  const getPurchaseById = (paymentId) => {
    return new Promise((resolve, reject) => {
      const response = (err, payment) => {
        if (err) {
          reject(
            new Error("An error occuered retrieving a order, err: " + err)
          );
        }

        logger.debug({ payment: payment }, "getPurchaseById");

        resolve(payment);
      };
      db.collection("payments").findOne(
        { "charge.id": paymentId },
        {},
        response
      );
    });
  };

  const disconnect = () => {
    logger.info("repository disconnect");

    db.close();
  };

  return Object.create({
    registerPurchase,
    getPurchaseById,
    disconnect,
  });
};

const connect = (container) => {
  logger.info({ container: container }, "repository connect");

  return new Promise((resolve, reject) => {
    if (!container.resolve("database")) {
      logger.error("connection db not supplied!");
      reject(new Error("connection db not supplied!"));
    }
    resolve(repository(container));
  });
};

module.exports = Object.assign({}, { connect });
