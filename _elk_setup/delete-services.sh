@echo off
echo Deleting Kubernetes resources...

kubectl delete -f kibana-config.yml
kubectl delete -f kibana-deployment.yml
kubectl delete -f logstash-config.yml
kubectl delete -f logstash-deployment.yml
kubectl delete -f apm-deployment.yml

echo Kubernetes resources deleted.
