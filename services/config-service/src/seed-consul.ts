import fs from "fs";
import path from "path";
import yaml from "js-yaml";

type ConfigMap = Record<string, unknown>;

type ConfigFile = {
  base?: ConfigMap;
  services: Record<string, ConfigMap>;
};

const CONSUL_HTTP_ADDR = process.env.CONSUL_HTTP_ADDR || "http://consul:8500";
const CONSUL_KV_PREFIX = process.env.CONSUL_KV_PREFIX || "config";

function loadYamlConfig(): ConfigFile {
  const filePath = path.resolve(process.cwd(), "config", "services.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw) as ConfigFile;

  if (!parsed || typeof parsed !== "object" || !parsed.services) {
    throw new Error("Invalid services.yaml: missing 'services' section");
  }

  return parsed;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForConsul(maxAttempts = 30): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${CONSUL_HTTP_ADDR}/v1/status/leader`);
      if (response.ok) {
        return;
      }
    } catch {
      // Consul is not ready yet.
    }

    console.log(`waiting for consul (${attempt}/${maxAttempts})`);
    await sleep(1000);
  }

  throw new Error("Consul did not become ready in time");
}

async function putKv(key: string, value: ConfigMap): Promise<void> {
  const url = `${CONSUL_HTTP_ADDR}/v1/kv/${CONSUL_KV_PREFIX}/${key}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });

  if (!response.ok) {
    throw new Error(`Failed to write ${key} to Consul`);
  }
}

async function seed(): Promise<void> {
  const config = loadYamlConfig();
  await waitForConsul();

  for (const [serviceName, serviceConfig] of Object.entries(config.services)) {
    await putKv(serviceName, serviceConfig);
    console.log(`seeded config/${serviceName}`);
  }

  console.log("consul seed done");
}

seed().catch((error) => {
  console.error("consul seed failed", error);
  process.exit(1);
});
