# Build a NodeJS microservice and deploy it to Docker

![](./cover.png)

This is the repo example for the article.

### Stack
We’ll use a simple NodeJS service with a MongoDB for our backend.
- NodeJS 7.5.0
- MongoDB 3.4.2
- Docker for Mac 1.13.0

### Microservices

- [Movies Service example](./movies-service)
- [Cinema Catalog Service example](./cinema-catalog-service)
- [Booking Service example](./booking-service)
- [Payment Service example](./payment-service)
- [Notification Service example](./notification-service)

### Setting Up Elasticsearch, Logstash, and Kibana in Kubernetes

We need to have docker and minikube installed previously.

In the `_elk_setup` folder, run the below command.

```
$ ./apply-services.sh
```
```
kubectl get pods
```

Ensure that all the services (Elasticsearch, Logstash, Kibana) are running properly.

Once the services are up and running, you can access the Kibana dashboard via the generated link:
```
minikube service kibana
```

### Setting Up MongoDB


In the `mongo-service` folder, run the below command.

```
$ kubectl apply -f monggo-deployment.yml
```

```
kubectl get pods
```

Ensure that MongoDB service is running properly.


### How to run the cinema microservice

In the `_kubernetes_setup` folder, run the below command.

```
$ ./apply-services.sh
```

This will basically install every microservice and setup the kubernetes cluster


### Blog posts

- [Build a NodeJS cinema microservice and deploying it with docker (part 1)](https://medium.com/@cramirez92/build-a-nodejs-cinema-microservice-and-deploying-it-with-docker-part-1-7e28e25bfa8b)
- [Build a NodeJS cinema microservice and deploying it with docker (part 2)](https://medium.com/@cramirez92/build-a-nodejs-cinema-microservice-and-deploying-it-with-docker-part-2-e05cc7b126e0)
- [Build a NodeJS cinema booking microservice and deploying it with docker (part 3)](https://medium.com/@cramirez92/build-a-nodejs-cinema-booking-microservice-and-deploying-it-with-docker-part-3-9c384e21fbe0)
- [Build a NodeJS cinema microservice and deploying it with docker (part 4)](https://medium.com/@cramirez92/build-a-nodejs-cinema-api-gateway-and-deploying-it-to-docker-part-4-703c2b0dd269#.en6g5buwl)
- [Deploy a Nodejs microservices to a Docker Swarm Cluster (Docker from zero to hero)](https://medium.com/@cramirez92/deploy-a-nodejs-microservices-to-a-docker-swarm-cluster-docker-from-zero-to-hero-464fa1369ea0#.548ni3uxv)

### LICENSE
The MIT License (MIT)

Copyright (c) 2017 Cristian Ramirez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
