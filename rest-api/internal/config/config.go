package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/go-playground/validator/v10"
	"gopkg.in/yaml.v3"
)

// Config is the schema for the application configuration.
type Config struct {
	Http struct {
		Host string `json:"host" yaml:"host" validate:"required,hostname|ip" default:""`
		Port int    `json:"port" yaml:"port" validate:"required,min=1,max=65535" default:"8080"`
		Cors struct {
			AllowOrigins     []string `json:"allow_origins" yaml:"allow_origins"`
			AllowMethods     []string `json:"allow_methods" yaml:"allow_methods"`
			AllowHeaders     []string `json:"allow_headers" yaml:"allow_headers"`
			AllowCredentials bool     `json:"allow_credentials" yaml:"allow_credentials"`
		} `json:"cors" yaml:"cors"`
	} `json:"http" yaml:"http" validate:"required"`
	Logger struct {
		Level            string   `json:"level" yaml:"level"`
		Encoding         string   `json:"encoding" yaml:"encoding"`
		OutputPaths      []string `json:"outputPaths" yaml:"outputPaths"`
		ErrorOutputPaths []string `json:"errorOutputPaths" yaml:"errorOutputPaths"`
	} `json:"logger" yaml:"logger"`
	Otel struct {
		Enabled  bool   `json:"enabled" yaml:"enabled" default:"false"`
		Endpoint string `json:"endpoint" yaml:"endpoint" validate:"omitempty,url" default:"http://localhost:4318"`
		Protocol string `json:"protocol" yaml:"protocol" default:"http"`  // "http" or "grpc"
		Insecure bool   `json:"insecure" yaml:"insecure" default:"false"` // true disables TLS
	} `json:"otel" yaml:"otel"`
}

// Load loads and validates the configuration from a file (YAML or JSON).
func Load(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open config: %w", err)
	}
	defer f.Close()

	var cfg Config
	switch ext := filepath.Ext(path); ext {
	case ".yaml", ".yml":
		if err := yaml.NewDecoder(f).Decode(&cfg); err != nil {
			return nil, fmt.Errorf("decode yaml: %w", err)
		}
	case ".json":
		if err := json.NewDecoder(f).Decode(&cfg); err != nil {
			return nil, fmt.Errorf("decode json: %w", err)
		}
	default:
		return nil, fmt.Errorf("unsupported config file extension: %s", ext)
	}

	validate := validator.New()
	if err := validate.Struct(cfg); err != nil {
		return nil, fmt.Errorf("config validation: %w", err)
	}
	return &cfg, nil
}
