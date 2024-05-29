#!/bin/bash
mongoimport --host localhost --db movies --collection movies --file /data/movies.json --jsonArray --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin
