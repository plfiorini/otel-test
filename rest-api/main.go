// main.go
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"rest-api/internal/config"
	"rest-api/internal/handlers/health"
	"rest-api/internal/logger"
	middlewares "rest-api/internal/middlewares/logger"
	"rest-api/internal/otel"

	"github.com/rs/cors"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.uber.org/zap"
)

func main() {
	configPath := flag.String("config", "config.yaml", "Path to config file (YAML or JSON)")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	zapLogger, cleanup, err := logger.New(*cfg)
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer cleanup()

	ctx := context.Background()
	otelShutdown, err := otel.Init(ctx, "rest-api", cfg)
	if err != nil {
		log.Fatalf("Failed to initialize OpenTelemetry: %v", err)
	}
	defer otelShutdown()

	// Set up CORS middleware
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   cfg.Http.Cors.AllowOrigins,
		AllowedMethods:   cfg.Http.Cors.AllowMethods,
		AllowedHeaders:   cfg.Http.Cors.AllowHeaders,
		AllowCredentials: cfg.Http.Cors.AllowCredentials,
	})

	// Create a new HTTP multiplexer
	mux := http.NewServeMux()

	// Set up routes
	mux.HandleFunc("/healthz", health.Healthz)
	mux.HandleFunc("/readyz", health.Readyz)

	// Wrap mux with logging and tracing middleware
	loggedMux := middlewares.Logger(zapLogger, mux)
	otelMux := otelhttp.NewHandler(loggedMux, "server")

	addr := fmt.Sprintf("%s:%d", cfg.Http.Host, cfg.Http.Port)

	zapLogger.Info("Starting server", zap.String("address", addr))
	if err := http.ListenAndServe(addr, corsHandler.Handler(otelMux)); err != nil {
		zapLogger.Fatal("Server failed", zap.Error(err))
	}
}
