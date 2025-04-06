# OpenTelemetry Node.js on Kubernetes

This project demonstrates how to set up OpenTelemetry with a Node.js application running on Kubernetes. It includes configurations for Grafana, Prometheus, Jaeger, and the OpenTelemetry Collector to visualize traces, metrics, and logs.

## Project Structure

```
otel-test
├── k8s
├── api
```

## Getting Started

### Prerequisites

- Kubernetes cluster (kind)
- kubectl installed and configured
- Docker installed

### Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd otel-test
   ```

2. **Create the cluster with kind:**

   ```bash
   cd k8s
   ./create-cluster.sh
   cd ..
   ```

3. **Deploy the OpenTelemetry components:**

   Apply the Kubernetes configurations for Grafana, Prometheus, Tempo, and the OpenTelemetry Collector:

   ```bash
   kubectl apply -f k8s/namespaces.yaml
   ./k8s/install.sh
   ```

3. **Build and deploy the Node.js application:**

   Build the Docker image:

   ```bash
   docker build -t otel-test-app .
   ```

   Deploy the application to Kubernetes (you may need to create a deployment.yaml for your app):

   ```bash
   kubectl apply -f k8s/api/
   ```

5. **Access Grafana:**

   Port-forward the Grafana service to access it on your local machine:

   ```bash
   kubectl port-forward -n monitoring svc/grafana 8080:80
   ```

   Then access Grafana in your browser at: http://localhost:8080
   
   Default login credentials are typically admin/admin.

   Open your browser and navigate to the Grafana URL to visualize metrics and traces.

### Usage

- The application will automatically send traces and metrics to the OpenTelemetry Collector.
- Grafana will display the collected metrics and traces.
- Jaeger can be used to visualize distributed traces.

### Contributing

Feel free to submit issues or pull requests for improvements or additional features.

### License

This project is licensed under the MIT License.
