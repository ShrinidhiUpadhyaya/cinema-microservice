@echo off
echo Deleting Kubernetes resources...

kubectl delete -f nginx-service-deployment.yml
kubectl delete -f nginx-configmap-deployment.yml
kubectl delete -f movies-service-deployment.yml
kubectl delete -f catalog-service-deployment.yml
kubectl delete -f booking-service-deployment.yml
kubectl delete -f payment-service-deployment.yml
kubectl delete -f notification-service-deployment.yml

echo Kubernetes resources deleted.
