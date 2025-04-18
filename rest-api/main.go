// main.go
package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"rest-api/internal/config"
	"rest-api/internal/handlers/health"
	"rest-api/internal/logger"
	middlewares "rest-api/internal/middlewares/logger"

	"github.com/rs/cors"
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

	// Set up CORS middleware
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   cfg.Http.Cors.AllowOrigins,
		AllowedMethods:   cfg.Http.Cors.AllowMethods,
		AllowedHeaders:   cfg.Http.Cors.AllowHeaders,
		AllowCredentials: cfg.Http.Cors.AllowCredentials,
	})

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", health.Healthz)
	mux.HandleFunc("/readyz", health.Readyz)

	// Wrap mux with logging middleware
	loggedMux := middlewares.Logger(zapLogger, mux)

	addr := fmt.Sprintf("%s:%d", cfg.Http.Host, cfg.Http.Port)

	zapLogger.Info("Starting server", zap.String("address", addr))
	if err := http.ListenAndServe(addr, corsHandler.Handler(loggedMux)); err != nil {
		zapLogger.Fatal("Server failed", zap.Error(err))
	}
}
