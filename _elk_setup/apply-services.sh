@echo off
echo Applying Kubernetes resources...

kubectl apply -f kibana-config.yml
kubectl apply -f apm-config.yml
kubectl apply -f logstash-config.yml

kubectl apply -f kibana-deployment.yml
kubectl apply -f logstash-deployment.yml
kubectl apply -f apm-deployment.yml

echo Kubernetes resources applied.
