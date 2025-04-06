#!/bin/bash

set -e

helm uninstall opentelemetry-kube-stack --namespace monitoring || true
helm uninstall grafana --namespace monitoring || true
helm uninstall tempo --namespace monitoring || true
helm uninstall prometheus --namespace monitoring || true
