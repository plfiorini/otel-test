#!/bin/bash

set -e

curdir=$(dirname `readlink -f $0`)

kubectl apply -k monitoring/
kubectl apply -k apps/
