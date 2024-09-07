@echo off
echo Deleting Kubernetes resources...

kubectl delete -f kibana-deployment.yml
kubectl delete -f logstash-deployment.yml

echo Kubernetes resources deleted.
