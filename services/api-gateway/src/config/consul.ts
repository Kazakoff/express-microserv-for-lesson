import axios from "axios";

const CONSUL_HTTP_ADDR = process.env.CONSUL_HTTP_ADDR || "http://consul:8500";
const CONSUL_KV_PREFIX = process.env.CONSUL_KV_PREFIX || "config";

export async function getConsulJson<T>(
  key: string
): Promise<T | null> {
  try {
    const url = `${CONSUL_HTTP_ADDR}/v1/kv/${CONSUL_KV_PREFIX}/${key}?raw=true`;
    const response = await axios.get(url, { timeout: 3000 });

    if (typeof response.data !== "string") return response.data as T;
    return JSON.parse(response.data) as T;
  } catch {
    return null;
  }
}

