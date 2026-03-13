import env from "dotenv";
import { getConsulJson } from "./consul";

env.config();

export type UserServiceConfig = {
  port: number;
};

export async function loadUserServiceConfig(): Promise<UserServiceConfig> {
  const fallback: UserServiceConfig = {
    port: Number(process.env.PORT) || 1000,
  };

  try {
    const service = await getConsulJson<Partial<UserServiceConfig>>("user-service");
    if (!service) return fallback;

    return {
      port: service.port ?? fallback.port,
    };
  } catch (error) {
    console.error(
      "Failed to load user-service config from Consul, using fallback:",
      error
    );
    return fallback;
  }
}

