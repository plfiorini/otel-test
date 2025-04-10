#!/bin/bash

curdir=$(dirname `readlink -f $0`)
namespace=$1

if [ -z "$namespace" ]; then
  echo "Usage: $0 <namespace>"
  exit 1
fi

# Functions for colored output
function info() {
    echo -e "\033[1;34m$1\033[0m"
}
function success() {
    echo -e "\033[1;32m$1\033[0m"
}
function error() {
    echo -e "\033[1;31m$1\033[0m"
}
function warning() {
    echo -e "\033[1;33m$1\033[0m"
}
function debug() {
    echo -e "\033[1;35m$1\033[0m"
}

debug "Install pod on namespace $namespace"
kubectl apply -f test/pod.yaml --namespace $namespace

# Wait for the pod to be ready
debug "Waiting for pod to be ready..."
kubectl wait --for=condition=ready pod -l app=dnsutils --namespace $namespace --timeout=60s
if [ $? -ne 0 ]; then
    error "Pod is not ready, exiting..."
    exit 1
fi

info "=== nslookup"
kubectl exec -i -t dnsutils --namespace $namespace -- nslookup kubernetes.default
[ $? -ne 0 ] && error "nslookup failed" && exit 1

info "=== resolv.conf"
kubectl exec -ti dnsutils --namespace $namespace -- cat /etc/resolv.conf
[ $? -ne 0 ] && error "cat /etc/resolv.conf failed" && exit 1
