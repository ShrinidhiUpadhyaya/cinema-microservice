@echo off
echo Applying Kubernetes resources...

kubectl apply -f secrets-deployment.yml
kubectl apply -f movies-service-deployment.yml
kubectl apply -f catalog-service-deployment.yml
kubectl apply -f booking-service-deployment.yml
kubectl apply -f payment-service-deployment.yml
kubectl apply -f notification-service-deployment.yml
kubectl apply -f nginx-configmap-deployment.yml
kubectl apply -f nginx-service-deployment.yml

echo Kubernetes resources applied.
