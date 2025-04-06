#!/bin/bash

set -e

curdir=$(dirname `readlink -f $0`)

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update

helm upgrade --install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --create-namespace

helm upgrade --install tempo grafana/tempo \
  --namespace monitoring \
  --create-namespace \
  --values ${curdir}/tempo-values.yaml

helm upgrade --install grafana grafana/grafana \
  --namespace monitoring \
  --values ${curdir}/grafana-values.yaml \
  --set adminPassword='admin' \
  --set persistence.enabled=true

# helm update --install loki grafana/loki \
#   --namespace monitoring \
#   --values ${curdir}/loki-valus.yaml

helm upgrade --install opentelemetry-kube-stack open-telemetry/opentelemetry-kube-stack \
  --namespace monitoring \
  --set opentelemetry-operator.admissionWebhooks.certManager.enabled=false \
  --set admissionWebhooks.autoGenerateCert.enabled=true
