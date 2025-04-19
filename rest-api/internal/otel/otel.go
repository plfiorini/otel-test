package otel

import (
	"context"
	"log"
	"strings"

	"rest-api/internal/config"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/log/global"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

type ShutdownFunc func()

func Init(ctx context.Context, serviceName string, cfg *config.Config) (ShutdownFunc, error) {
	// Skip initialization if OpenTelemetry is not enabled
	if !cfg.Otel.Enabled {
		return func() {}, nil
	}

	// Resource describing this service
	res, err := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceName(serviceName),
		),
	)
	if err != nil {
		return nil, err
	}

	// Determine endpoint and security
	endpoint := cfg.Otel.Endpoint
	isInsecure := strings.HasPrefix(endpoint, "http://")
	trimmedEndpoint := strings.TrimPrefix(endpoint, "http://")
	trimmedEndpoint = strings.TrimPrefix(trimmedEndpoint, "https://")

	// Traces exporter and provider
	traceOpts := []otlptracehttp.Option{
		otlptracehttp.WithEndpoint(trimmedEndpoint),
	}
	if isInsecure {
		traceOpts = append(traceOpts, otlptracehttp.WithInsecure())
	}
	traceExp, err := otlptracehttp.New(ctx, traceOpts...)
	if err != nil {
		return nil, err
	}
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(traceExp),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(tp)

	// Metrics exporter and provider
	metricOpts := []otlpmetrichttp.Option{
		otlpmetrichttp.WithEndpoint(trimmedEndpoint),
	}
	if isInsecure {
		metricOpts = append(metricOpts, otlpmetrichttp.WithInsecure())
	}
	metricExp, err := otlpmetrichttp.New(ctx, metricOpts...)
	if err != nil {
		return nil, err
	}
	mp := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(metricExp)),
		sdkmetric.WithResource(res),
	)
	otel.SetMeterProvider(mp)

	// Set up OpenTelemetry logging if needed
	logOpts := []otlploghttp.Option{
		otlploghttp.WithEndpoint(trimmedEndpoint),
	}
	if isInsecure {
		logOpts = append(logOpts, otlploghttp.WithInsecure())
	}
	logExp, err := otlploghttp.New(ctx, logOpts...)
	if err != nil {
		log.Fatalf("Failed to create log exporter: %v", err)
	}
	lp := sdklog.NewLoggerProvider(sdklog.WithProcessor(sdklog.NewBatchProcessor(logExp)))
	global.SetLoggerProvider(lp)

	return func() {
		if err := tp.Shutdown(ctx); err != nil {
			log.Printf("Error shutting down tracer provider: %v", err)
		}
		if err := mp.Shutdown(ctx); err != nil {
			log.Printf("Error shutting down meter provider: %v", err)
		}
		if err := lp.Shutdown(ctx); err != nil {
			log.Printf("Error shutting down logger provider: %v", err)
		}
	}, nil
}
