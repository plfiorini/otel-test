#!/bin/bash

set -e

curdir=$(dirname `readlink -f $0`)

kubectl delete -k monitoring/
kubectl delete -k apps/
