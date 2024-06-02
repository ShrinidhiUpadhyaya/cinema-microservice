#!/bin/bash
mongoimport --host localhost --db movies --collection movies --file /data/movies.json --jsonArray --username root --password password --authenticationDatabase admin
mongoimport --host localhost --db cinemas --collection cinemas --file /data/cinemas.json --jsonArray --username root --password password --authenticationDatabase admin
mongoimport --host localhost --db cities --collection cities --file /data/cities.json --jsonArray --username root --password password --authenticationDatabase admin
mongoimport --host localhost --db countries --collection countries --file /data/countries.json --jsonArray --username root --password password --authenticationDatabase admin
mongoimport --host localhost --db states --collection states --file /data/states.json --jsonArray --username root --password password --authenticationDatabase admin
