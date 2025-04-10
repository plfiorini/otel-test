#!/bin/bash

set -e

curdir=$(dirname `readlink -f $0`)

kubectl config use-context kind-otel-test

kubectl delete -k monitoring/
kubectl delete -k apps/
