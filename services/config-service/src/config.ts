import env from "dotenv";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

env.config();

type ServiceName =
  | "api-gateway"
  | "user-service"
  | "order-service"
  | "payment-service"
  | "notification-service";

type ConfigMap = Record<string, unknown>;

type ConfigFile = {
  base: ConfigMap;
  services: Record<ServiceName, ConfigMap>;
};

function readYamlConfig(): ConfigFile {
  const filePath = path.resolve(process.cwd(), "config", "services.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw) as ConfigFile;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid YAML config format");
  }

  if (!parsed.base || typeof parsed.base !== "object") {
    throw new Error("Missing 'base' section in YAML config");
  }

  if (!parsed.services || typeof parsed.services !== "object") {
    throw new Error("Missing 'services' section in YAML config");
  }

  return parsed;
}

const yamlConfig = readYamlConfig();
const baseConfig: ConfigMap = yamlConfig.base;
const serviceConfigs: Record<ServiceName, ConfigMap> = yamlConfig.services;

export function getConfig(service: ServiceName | "all") {
  if (service === "all") {
    return {
      base: baseConfig,
      services: serviceConfigs,
    };
  }

  if (!(service in serviceConfigs)) {
    throw new Error("Invalid service name");
  }

  return {
    base: baseConfig,
    service: serviceConfigs[service],
  };
}

