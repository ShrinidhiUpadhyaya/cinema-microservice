@echo off
echo Deleting Kubernetes resources...

kubectl delete -f kibana-deployment.yml
kubectl delete -f logstash-deployment.yml
#-------------------------------- Enable For Kafka --------------------------------
#kubectl delete -f kafka-deployment.yml

echo Kubernetes resources deleted.
