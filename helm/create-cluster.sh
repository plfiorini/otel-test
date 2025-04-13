#!/bin/bash

set -e

name="otel-test"

# Check if kind is installed
if ! command -v kind &> /dev/null; then
    echo "Error: kind is not installed. Please install kind first."
    echo "See: https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
    exit 1
fi

echo "Creating cluster '${name}'..."

# Create the cluster
kind create cluster --name ${name}

# Verify the cluster was created
echo "Verifying cluster '${name}'..."
kubectl cluster-info --context kind-${name}
if [ $? -ne 0 ]; then
    echo "Error: Cluster '${name}' was not created successfully."
    exit 1
fi

echo "Cluster '${name}' is ready!"
echo "To delete the cluster when done: kind delete cluster --name ${name}"
