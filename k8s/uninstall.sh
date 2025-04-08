#!/bin/bash

set -e

helm uninstall --namespace monitoring otel-collector || true
helm uninstall --namespace monitoring tempo || true
helm uninstall --namespace monitoring loki || true
helm uninstall --namespace monitoring grafana || true
helm uninstall --namespace monitoring prometheus || true
