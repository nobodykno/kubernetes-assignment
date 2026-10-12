# Kubernetes Microservices Monitoring Assignment

## Overview
This project runs Node.js API Gateway, Worker, and Stats services with Redis on Minikube. Kubernetes HPA scales Worker pods based on CPU. Prometheus collects metrics and Grafana displays dashboards.

## Tech Stack
Node.js, TypeScript, Redis, Docker, Kubernetes, Minikube, kubectl, Helm, NGINX Ingress, Metrics Server, HPA, Prometheus, Grafana.

## Important YAML Files

| File | Purpose |
|---|---|
| `configmap.yml` | Stores non-secret application configuration. |
| `redis.yml` | Creates Redis Deployment and Service. |
| `api-gateway.yml` | Deploys the API Gateway and exposes it inside the cluster. |
| `worker.yml` | Deploys Worker pods that process jobs. |
| `stats.yml` | Deploys the Stats service and its metrics endpoint. |
| `worker-hpa.yml` | Scales Worker replicas based on CPU (configured from 2 to 10, target 70%). |
| `ingress.yml` / API Gateway Ingress | Routes incoming application requests to the API Gateway. |
| `prometheus-ingress.yml` | Creates an Ingress rule for accessing Prometheus through the hostname `prometheus.local`, forwarding traffic to the Prometheus Service. |
| `grafana-ingress.yml` | Creates an Ingress rule for accessing Grafana through `grafana.local`, forwarding traffic to the Grafana Service. |
| `ServiceMonitor` YAML | Tells Prometheus how to discover and scrape the Worker and Stats `/metrics` endpoints. |

**Note:** Ingress YAML files define routing rules; they are not LoadBalancer Services. The NGINX Ingress Controller handles the routing.

## Start and Check the Cluster


minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
kubectl config current-context
kubectl get nodes


Apply the YAML files using their actual paths in your repository, for example:


kubectl apply -f kubernetes/


Only use the directory command after checking it contains the intended manifests.

## Monitoring

Prometheus and Grafana were installed with Helm using `kube-prometheus-stack`. Check their resources and Ingress rules:


helm list -n monitoring
kubectl get pods,svc,ingress -n monitoring
kubectl get servicemonitor -A
kubectl get ingress -A


The local host entries should map `prometheus.local` and `grafana.local` to the address used to reach your Ingress controller. The exact access URL depends on your Minikube/Ingress networking setup.

## Test the Application and HPA

Submit a job to the API Gateway using the route configured by the application (in this project, `POST /v1/jobs/submit`). Example:


curl -X POST http://localhost/v1/jobs/submit \
  -H "Content-Type: application/json" \
  -d '{"type":"primes"}'


Watch Worker scaling while sending multiple jobs:


kubectl get hpa worker-hpa -n microservices --watch
kubectl get pods -n microservices -l app=worker --watch
kubectl top pods -n microservices
kubectl logs -f deployment/worker -n microservices


During the load test, the HPA was observed scaling Worker replicas from 2 to 4 when CPU exceeded the 70% target.

## Useful Checks


kubectl get all -n microservices
kubectl get events -n microservices --sort-by=.lastTimestamp
kubectl describe hpa worker-hpa -n microservices
kubectl get pods,svc,ingress -n monitoring


If an Ingress URL fails, check the hostname mapping, Ingress rules, NGINX Ingress Controller, and backend Service endpoints.
