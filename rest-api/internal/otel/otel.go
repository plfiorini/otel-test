package otel

import (
	"context"
	"log"
	"strings"

	"rest-api/internal/config"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
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
	isInsecure := cfg.Otel.Insecure
	protocol := strings.ToLower(cfg.Otel.Protocol) // "http" or "grpc"
	trimmedEndpoint := strings.TrimPrefix(endpoint, "http://")
	trimmedEndpoint = strings.TrimPrefix(trimmedEndpoint, "https://")

	// Traces exporter and provider
	var traceExp sdktrace.SpanExporter
	switch protocol {
	case "grpc":
		traceOpts := []otlptracegrpc.Option{
			otlptracegrpc.WithEndpoint(trimmedEndpoint),
		}
		if isInsecure {
			traceOpts = append(traceOpts, otlptracegrpc.WithInsecure())
		}
		var err error
		traceExp, err = otlptracegrpc.New(ctx, traceOpts...)
		if err != nil {
			return nil, err
		}
	default: // "http"
		traceOpts := []otlptracehttp.Option{
			otlptracehttp.WithEndpoint(trimmedEndpoint),
		}
		if isInsecure {
			traceOpts = append(traceOpts, otlptracehttp.WithInsecure())
		}
		var err error
		traceExp, err = otlptracehttp.New(ctx, traceOpts...)
		if err != nil {
			return nil, err
		}
	}
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(traceExp),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(tp)

	// Metrics exporter and provider
	var metricExp sdkmetric.Exporter
	switch protocol {
	case "grpc":
		metricOpts := []otlpmetricgrpc.Option{
			otlpmetricgrpc.WithEndpoint(trimmedEndpoint),
		}
		if isInsecure {
			metricOpts = append(metricOpts, otlpmetricgrpc.WithInsecure())
		}
		var err error
		metricExp, err = otlpmetricgrpc.New(ctx, metricOpts...)
		if err != nil {
			return nil, err
		}
	default: // "http"
		metricOpts := []otlpmetrichttp.Option{
			otlpmetrichttp.WithEndpoint(trimmedEndpoint),
		}
		if isInsecure {
			metricOpts = append(metricOpts, otlpmetrichttp.WithInsecure())
		}
		var err error
		metricExp, err = otlpmetrichttp.New(ctx, metricOpts...)
		if err != nil {
			return nil, err
		}
	}
	mp := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(metricExp)),
		sdkmetric.WithResource(res),
	)
	otel.SetMeterProvider(mp)

	// Logs exporter and provider
	var logExp sdklog.Exporter
	switch protocol {
	case "grpc":
		logOpts := []otlploggrpc.Option{
			otlploggrpc.WithEndpoint(trimmedEndpoint),
		}
		if isInsecure {
			logOpts = append(logOpts, otlploggrpc.WithInsecure())
		}
		var err error
		logExp, err = otlploggrpc.New(ctx, logOpts...)
		if err != nil {
			log.Fatalf("Failed to create log exporter: %v", err)
		}
	default: // "http"
		logOpts := []otlploghttp.Option{
			otlploghttp.WithEndpoint(trimmedEndpoint),
		}
		if isInsecure {
			logOpts = append(logOpts, otlploghttp.WithInsecure())
		}
		var err error
		logExp, err = otlploghttp.New(ctx, logOpts...)
		if err != nil {
			log.Fatalf("Failed to create log exporter: %v", err)
		}
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
