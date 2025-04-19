package logger

import (
	"rest-api/internal/config"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func New(cfg config.Config) (*zap.Logger, func(), error) {
	zapCfg := zap.Config{
		Level:            zap.NewAtomicLevelAt(parseZapLevel(cfg.Logger.Level)),
		Development:      false,
		Encoding:         cfg.Logger.Encoding,
		OutputPaths:      cfg.Logger.OutputPaths,
		ErrorOutputPaths: cfg.Logger.ErrorOutputPaths,
		EncoderConfig:    zap.NewProductionEncoderConfig(),
	}
	if zapCfg.Encoding == "console" {
		zapCfg.EncoderConfig = zap.NewDevelopmentEncoderConfig()
		zapCfg.EncoderConfig.EncodeLevel = colorLevelEncoder

		// Pino-like formatting:
		zapCfg.EncoderConfig.TimeKey = "time"
		zapCfg.EncoderConfig.LevelKey = "level"
		zapCfg.EncoderConfig.NameKey = "logger"
		zapCfg.EncoderConfig.CallerKey = "caller"
		zapCfg.EncoderConfig.MessageKey = "msg"
		zapCfg.EncoderConfig.StacktraceKey = "stack"
		zapCfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		zapCfg.EncoderConfig.EncodeCaller = zapcore.ShortCallerEncoder
		zapCfg.EncoderConfig.ConsoleSeparator = " " // Use space instead of tab
	}
	logger, err := zapCfg.Build()
	if err != nil {
		return nil, func() {}, err
	}
	return logger, func() { logger.Sync() }, nil
}

func parseZapLevel(level string) zapcore.Level {
	switch level {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	case "dpanic":
		return zapcore.DPanicLevel
	case "panic":
		return zapcore.PanicLevel
	case "fatal":
		return zapcore.FatalLevel
	default:
		return zapcore.InfoLevel
	}
}

// colorLevelEncoder adds ANSI color codes to log levels for console output.
func colorLevelEncoder(level zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
	var color string
	switch level {
	case zapcore.DebugLevel:
		color = "\033[36m" // Cyan
	case zapcore.InfoLevel:
		color = "\033[32m" // Green
	case zapcore.WarnLevel:
		color = "\033[33m" // Yellow
	case zapcore.ErrorLevel, zapcore.DPanicLevel:
		color = "\033[31m" // Red
	case zapcore.PanicLevel, zapcore.FatalLevel:
		color = "\033[35m" // Magenta
	default:
		color = "\033[0m" // Reset
	}
	enc.AppendString(color + level.CapitalString() + "\033[0m")
}
