"use strict";
const { logger } = require("../config/logger");

const repository = (connection) => {
  const { db, ObjectID } = connection;

  const collection = db.collection("cinemas");

  const getCinemasByCity = (cityId) => {
    return new Promise(async (resolve, reject) => {
      const cinemas = [];
      const query = { city_id: cityId };
      const cursor = collection.find(query);
      try {
        await cursor.forEach((movie) => {
          cinemas.push(movie);
        });

        resolve(cinemas);
      } catch (err) {
        reject(new Error("An error occured fetching all movies, err:" + err));
      }
    });
  };

  const getCinemaById = (cinemaId) => {
    return new Promise(async (resolve, reject) => {
      const query = { _id: new ObjectID(cinemaId) };
      const cinema = await collection.findOne(query);

      try {
        resolve(cinema);
      } catch (err) {
        reject(new Error("An error occuered retrieving a cinema, err: " + err));
      }
    });
  };

  const getCinemaScheduleByMovie = (options) => {
    return new Promise(async (resolve, reject) => {
      const match = {
        $match: {
          city_id: options.cityId,
          "cinemaRooms.schedules.movie_id": options.movieId,
        },
      };
      const project = {
        $project: {
          name: 1,
          "cinemaRooms.schedules.time": 1,
          "cinemaRooms.name": 1,
          "cinemaRooms.format": 1,
        },
      };
      const unwind = [
        { $unwind: "$cinemaRooms" },
        { $unwind: "$cinemaRooms.schedules" },
      ];
      const group = [
        {
          $group: {
            _id: {
              name: "$name",
              room: "$cinemaRooms.name",
            },
            schedules: { $addToSet: "$cinemaRooms.schedules.time" },
          },
        },
        {
          $group: {
            _id: "$_id.name",
            schedules: {
              $addToSet: {
                room: "$_id.room",
                schedules: "$schedules",
              },
            },
          },
        },
      ];

      try {
        const result = await collection
          .aggregate([match, project, ...unwind, ...group])
          .toArray();
        const query = { city_id: options.cityId };
        resolve(result);
      } catch (err) {
        reject("An error has occured fetching schedules by movie, err: " + err);
      }
    });
  };

  const disconnect = () => {
    logger.info("db.disconnect");
    db.close();
  };

  return Object.create({
    getCinemasByCity,
    getCinemaById,
    getCinemaScheduleByMovie,
    disconnect,
  });
};

const connect = (connection) => {
  logger.info("repository connect");

  return new Promise((resolve, reject) => {
    if (!connection) {
      logger.error("connection db not supplied!");

      reject(new Error("connection db not supplied!"));
    }
    resolve(repository(connection));
  });
};

module.exports = Object.assign({}, { connect });
