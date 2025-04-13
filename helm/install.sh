#!/bin/bash

# See https://github.com/grafana/tempo/tree/main/example/helm

set -e

curdir=$(dirname `readlink -f $0`)

helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

kubectl config use-context kind-otel-test

helm upgrade --install tempo grafana/tempo \
    --namespace monitoring \
    --create-namespace
helm upgrade -f grafana-values.yaml --install grafana grafana/grafana \
    --namespace monitoring \
    --create-namespace

kubectl apply -f extras.yaml \
    --namespace monitoring
