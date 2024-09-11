"use strict";

const os = require("os");

const repository = (container) => {
  const { database: db } = container.cradle;

  const makeBooking = (user, booking) => {
    return new Promise((resolve, reject) => {
      const payload = {
        city: booking.city,
        userType: user.membership ? "loyal" : "normal",
        totalAmount: booking.totalAmount,
        cinema: {
          name: booking.cinema,
          room: booking.cinemaRoom,
          seats: booking.seats.toString(),
        },
        movie: {
          title: booking.movie.title,
          format: booking.movie.format,
          schedule: booking.schedule,
        },
      };

      try {
        db.collection("booking").insertOne(payload);
        resolve(payload);
      } catch {
        reject(
          new Error("An error occuered registring a user booking, err:" + err)
        );
      }
    });
  };

  const generateTicket = (paid, booking) => {
    return new Promise((resolve, reject) => {
      const payload = Object.assign({}, booking, {
        orderId: paid.charge.id,
        description: paid.description,
      });

      try {
        db.collection("tickets").insertOne(payload);
        resolve(payload);
      } catch {
        reject(
          reject(new Error("an error occured registring a ticket, err:" + err))
        );
      }
    });
  };

  const getOrderById = (orderId) => {
    return new Promise((resolve, reject) => {
      const ObjectID = container.resolve("ObjectID");
      const query = { _id: new ObjectID(orderId) };
      const response = (err, order) => {
        if (err) {
          reject(
            new Error("An error occuered retrieving a order, err: " + err)
          );
        }
        resolve(order);
      };
      db.collection("booking").findOne(query, {}, response);
    });
  };

  const disconnect = () => {
    console.info({
      application: "booking-service",
      system: os.hostname(),
      message: "db.disconnect",
      timestamp: Date.now(),
      level: "info",
    });
    db.close();
  };

  return Object.create({
    makeBooking,
    getOrderById,
    generateTicket,
    disconnect,
  });
};

const connect = (container) => {
  console.info({
    application: "booking-service",
    system: os.hostname(),
    message: "repository connect",
    timestamp: Date.now(),
    level: "info",
    values: container,
  });
  return new Promise((resolve, reject) => {
    if (!container.resolve("database")) {
      console.error({
        application: "booking-service",
        system: os.hostname(),
        message: "connection db not supplied!",
        timestamp: Date.now(),
        level: "error",
      });
      reject(new Error("connection db not supplied!"));
    }
    resolve(repository(container));
  });
};

module.exports = Object.assign({}, { connect });
