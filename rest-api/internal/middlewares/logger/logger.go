package middlewares

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"rest-api/internal/logger"

	"go.uber.org/zap"
)

type ctxKeyLogger struct{}

// Logger logs HTTP requests using zap and injects logger with trace/span IDs into context
func Logger(baseLogger *zap.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Add trace info to logger using request context
		loggerWithTrace := logger.WithTrace(r.Context(), baseLogger)
		ctx := context.WithValue(r.Context(), ctxKeyLogger{}, loggerWithTrace)

		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(rw, r.WithContext(ctx))
		duration := time.Since(start)

		loggerWithTrace.Info(fmt.Sprintf("HTTP %s %s", r.Method, r.URL.Path),
			zap.String("method", r.Method),
			zap.String("path", r.URL.Path),
			zap.Int("status", rw.statusCode),
			zap.Duration("duration", duration),
		)
	})
}

// FromContext extracts the logger from context, or returns a no-op logger if missing
func FromContext(ctx context.Context) *zap.Logger {
	if l, ok := ctx.Value(ctxKeyLogger{}).(*zap.Logger); ok && l != nil {
		return l
	}
	return zap.NewNop()
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}
