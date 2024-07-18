"use strict";
const { logger } = require("../config/logger");

const repository = (db) => {
  const collection = db.collection("movies");

  const getAllMovies = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const movies = [];
        const cursor = collection.find();

        await cursor.forEach((movie) => {
          movies.push(movie);
        });

        resolve(movies.slice());
      } catch (err) {
        reject(new Error("An error occured fetching all movies, err:" + err));
      }
    });
  };

  const getMoviePremiers = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const movies = [];
        const currentDay = new Date();
        const query = {
          releaseYear: {
            $gt: currentDay.getFullYear() - 1,
            $lte: currentDay.getFullYear(),
          },
          releaseMonth: {
            $gte: currentDay.getMonth() + 1,
            $lte: currentDay.getMonth() + 2,
          },
          releaseDay: {
            $lte: currentDay.getDate(),
          },
        };
        const cursor = collection.find(query);
        await cursor.forEach((movie) => {
          movies.push(movie);
        });
        resolve(movies);
      } catch (err) {
        reject(new Error("An error occured fetching all movies, err:" + err));
      }
    });
  };

  const getMovieById = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const movie = collection.findOne({ id: id });
        resolve(movie);
      } catch (err) {
        reject(
          new Error(
            `An error occured fetching a movie with id: ${id}, err: ${err}`
          )
        );
      }
    });
  };

  const disconnect = () => {
    logger.info("db.disconnect");
    db.close();
  };

  return Object.create({
    getAllMovies,
    getMoviePremiers,
    getMovieById,
    disconnect,
  });
};

const connect = (connection) => {
  logger.info("repository connect");

  return new Promise((resolve, reject) => {
    logger.error("connection db not supplied!");
    if (!connection) {
      reject(new Error("connection db not supplied!"));
    }
    resolve(repository(connection));
  });
};

module.exports = Object.assign({}, { connect });
