#!/bin/sh

set -e

name=otel-test-api
version=latest
tag=plfiorini/${name}:${version}

docker build -t ${tag} .
docker push $tag

echo "Update image version to $version"
