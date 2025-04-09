import * as fs from "node:fs";
import * as yaml from "js-yaml";
import { z } from "zod";

// Define the schema using zod
const ConfigSchema = z.object({
	otelUrl: z.string().url(),
	prometheusUrl: z.string().url(),
});

// Infer the ConfigType from the schema
export type ConfigType = z.infer<typeof ConfigSchema>;

// Singleton instance to store the loaded config
let configInstance: ConfigType | null = null;

// Function to load and validate the config file
export function loadConfig(filePath: string): ConfigType {
	const fileContent = fs.readFileSync(filePath, "utf8");
	const parsedConfig = yaml.load(fileContent);

	// Validate the parsed config against the schema
	return ConfigSchema.parse(parsedConfig);
}

// Function to get an existing configuration or load it if not already loaded
export function getConfig(filePath: string): ConfigType {
	if (configInstance) {
		return configInstance;
	}
	configInstance = loadConfig(filePath);
	return configInstance;
}
