#!/bin/bash

set -e

curdir=$(dirname `readlink -f $0`)

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update

kubectl config use-context kind-otel-test

helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values ${curdir}/prometheus-values.yaml

helm upgrade --install grafana grafana/grafana \
  --namespace monitoring \
  --create-namespace \
  --values ${curdir}/grafana-values.yaml

helm upgrade --install loki grafana/loki-stack \
  --namespace monitoring \
  --create-namespace \
  --values ${curdir}/loki-values.yaml

helm upgrade --install tempo grafana/tempo-distributed \
  --namespace monitoring \
  --create-namespace \
  --values ${curdir}/tempo-values.yaml

helm upgrade --install otel-collector open-telemetry/opentelemetry-collector \
  --namespace monitoring \
  --create-namespace \
  --values ${curdir}/otel-values.yaml
