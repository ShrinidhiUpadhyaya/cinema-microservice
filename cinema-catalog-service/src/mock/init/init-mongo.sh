#!/bin/bash
mongoimport --host localhost --db cinemas --collection cinemas --file /data/cinemas.json --jsonArray
mongoimport --host localhost --db cities --collection cities --file /data/cities.json --jsonArray
mongoimport --host localhost --db countries --collection countries --file /data/countries.json --jsonArray
mongoimport --host localhost --db states --collection states --file /data/states.json --jsonArray
