import * as fs from "fs";
import * as yaml from "js-yaml";

export type ConfigType = {
	otelUrl: string;
	prometheusUrl: string;
};

export class Config {
	private static instance: Config;

	public otelUrl: string;
	public prometheusUrl: string;

	private constructor(filePath: string) {
		const config = this.loadConfig(filePath);
		this.otelUrl = config.otelUrl;
		this.prometheusUrl = config.prometheusUrl;
	}

	public static getInstance(filePath: string): Config {
		if (!Config.instance) {
			Config.instance = new Config(filePath);
		}
		return Config.instance;
	}

	private loadConfig(filePath: string): ConfigType {
		try {
			const fileContents = fs.readFileSync(filePath, "utf8");
			return yaml.load(fileContents) as ConfigType;
		} catch (error) {
			console.error(`Failed to load configuration from ${filePath}:`, error);
			throw error;
		}
	}
}
