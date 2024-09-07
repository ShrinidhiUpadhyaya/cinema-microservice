@echo off
echo Applying Kubernetes resources...

kubectl apply -f kibana-deployment.yml
kubectl apply -f logstash-deployment.yml

echo Kubernetes resources applied.
